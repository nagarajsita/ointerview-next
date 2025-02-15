'use client'

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chat from "@/components/Chat";

interface Language {
  label: string;
  value: string;
}

interface Theme {
  label: string;
  value: string;
}

const Candidate = () => {
  const router = useRouter();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const vRef = useRef<HTMLVideoElement | null>(null);
  const aRef = useRef<HTMLAudioElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [audioP, setAudioP] = useState<boolean>(true);
  const [videoP, setVideoP] = useState<boolean>(true);

  const [roomId, setRoomId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [resumeLink, setResumeLink] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [theme, setTheme] = useState<string>("vs-dark");

  const languages: Language[] = [
    { label: "JavaScript", value: "javascript" },
    { label: "Python", value: "python" },
    { label: "Java", value: "java" },
    { label: "C++", value: "cpp" }
  ];

  const themes: Theme[] = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "vs-dark" }
  ];

  const cleanupConnection = () => {
    if (localVideoRef.current?.srcObject instanceof MediaStream) {
      localVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (vRef.current?.srcObject instanceof MediaStream) {
      vRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    if (aRef.current?.srcObject instanceof MediaStream) {
      aRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    localVideoRef.current = null;
    vRef.current = null;
    aRef.current = null;
  };

  const handleHangUp = () => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p className="font-medium">Leave Interview Session?</p>
          <div className="flex justify-end mt-2">
            <button
              className="bg-red-500 text-white px-3 py-1 rounded mr-2 hover:bg-red-600"
              onClick={() => {
                confirmHangUp();
                closeToast?.();
              }}
            >
              Leave Session
            </button>
            <button
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeButton: false,
        position: "top-center"
      }
    );
  };

  const confirmHangUp = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "terminateRoom",
          roomId,
          role: "receiver"
        })
      );
    }
    cleanupConnection();
    if (socket) {
      socket.close();
    }
    toast.success("Interview session ended successfully");
    setRoomId("");
    setIsModalOpen(true);
    router.push("/");
  };

  useEffect(() => {
    const socket1 = new WebSocket("wss://localhost:8080");
    setSocket(socket1);

    socket1.onopen = () => {
      if (roomId) {
        socket1.send(
          JSON.stringify({ type: "joinRoom", roomId, role: "sender" })
        );
      }
    };

    socket1.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "createAnswer" && data.sdp) {
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(data.sdp)
            );
          }
        } else if (data.type === "iceCandidate" && data.candidate) {
          if (pcRef.current) {
            await pcRef.current.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          }
        } else if (data.type === "error") {
          toast.error(data.message);
        } else if(data.type === "MeetingEnded"){
          toast.warning("Interview ended");
          setRoomId("");
          pcRef.current?.close();
          pcRef.current = null;
          vRef.current = null;
          localVideoRef.current = null;
          toast.info("Meeting ended");
          setTimeout(() => router.push("/"), 5000);
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    return () => {
      socket1.close();
    };
  }, [roomId, router]);

  async function startSendingVideo() {
    if (!roomId) return;
    setIsModalOpen(false);
    if (!socket) return;

    const peerConnection = new RTCPeerConnection();
    pcRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    peerConnection.ontrack = (event) => {
      if (event.track.kind === "video" && vRef.current) {
        vRef.current.srcObject = new MediaStream([event.track]);
      }
      if (event.track.kind === "audio" && aRef.current) {
        aRef.current.srcObject = new MediaStream([event.track]);
        aRef.current.volume = 1;
        aRef.current.play().catch(console.error);
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socket.send(
        JSON.stringify({
          type: "createOffer",
          roomId,
          sdp: peerConnection.localDescription,
          r_link:resumeLink
        })
      );
    } catch (error) {
      console.error("Error starting video stream:", error);
      toast.error("Failed to access camera/microphone");
    }
  }

  const onChangeHandler = (value: string | undefined) => {
    if (socket && socket.readyState === WebSocket.OPEN && value !== undefined) {
      socket.send(
        JSON.stringify({
          type: "editorContent",
          roomId: roomId,
          content: value
        })
      );
    }
  };

  const toggleVideo = () => {
    if (pcRef.current?.getSenders()) {
      const videoSender = pcRef.current
        .getSenders()
        .find((sender) => sender.track?.kind === "video");
      if (videoSender?.track) {
        videoSender.track.enabled = !videoSender.track.enabled;
        setVideoP(videoSender.track.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (pcRef.current?.getSenders()) {
      const audioTrack = pcRef.current
        .getSenders()
        .find((sender) => sender.track?.kind === "audio");
      if (audioTrack?.track) {
        audioTrack.track.enabled = !audioTrack.track.enabled;
        setAudioP(audioTrack.track.enabled);
      }
    }
  };

  return (
    <div className="container mx-auto py-3">
      <ToastContainer position="top-right" />
      {isModalOpen && (
         <div className="w-full h-full fixed z-50 inset-0 backdrop-blur-[2px] flex items-center justify-center p-4">
         <div className="bg-white ring-[0.5px] rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 w-full max-w-md py-8">
           <div className="flex flex-col items-center px-6">
             <h2 className="text-3xl font-bold text-gray-800 mb-8">
               Join Room
             </h2>
           </div>
   
           <div className="flex flex-col gap-6 px-6">
             <div className="space-y-1">
               <input
                 type="text"
                 value={roomId}
                 onChange={(e) => setRoomId(e.target.value)}
                 placeholder="Enter Room ID"
                 className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 
                          text-gray-700 placeholder:text-gray-400
                          focus:ring-4 focus:ring-blue-100 focus:border-blue-500 
                          focus:outline-none transition-all duration-200
                          hover:border-gray-300"
               />
             </div>
   
             <div className="space-y-1">
               <input
                 type="text"
                 value={resumeLink}
                 onChange={(e) => setResumeLink(e.target.value)}
                 placeholder="Enter Resume Drive Link"
                 className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 
                          text-gray-700 placeholder:text-gray-400
                          focus:ring-4 focus:ring-blue-100 focus:border-blue-500 
                          focus:outline-none transition-all duration-200
                          hover:border-gray-300"
               />
             </div>
   
             <button
               onClick={startSendingVideo}
               className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 
                        text-white py-3.5 rounded-xl font-semibold text-lg
                        shadow-lg shadow-blue-500/30
                        hover:from-blue-600 hover:to-blue-700
                        active:from-blue-700 active:to-blue-800
                        focus:ring-4 focus:ring-blue-100 focus:outline-none
                        transform transition-all duration-200
                        hover:-translate-y-0.5 active:translate-y-0"
             >
               Join Room
             </button>
           </div>
         </div>
       </div>
      
      )}

      {roomId && (
        <div className="space-y-4">
          <div className="flex flex-row justify-evenly items-center border p-5 rounded-lg shadow-lg bg-white">
            {/* Remote Video */}
            <div className="flex flex-col items-center bg-white p-2 rounded-lg shadow-md mx-4">
              <div className="relative w-96 h-56">
                <video
                  autoPlay
                  muted
                  ref={vRef}
                  className="w-full h-full object-fill rounded-lg shadow-md"
                />
                <audio ref={aRef} autoPlay />
              </div>
            </div>

            {/* Local Video */}
            <div className="relative flex flex-col items-center bg-white p-2 rounded-lg shadow-lg mx-4">
              <div className="relative w-96 h-56">
                <video
                  autoPlay
                  muted
                  ref={localVideoRef}
                  className="w-full h-full object-fill rounded-lg shadow-md"
                />
                <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <Image
                    src={videoP ? "/video.png" : "/video-off.png"}
                    alt={videoP ? "video" : "video-off"}
                    width={32}
                    height={32}
                    onClick={toggleVideo}
                    className="p-1 rounded-full shadow-lg bg-white cursor-pointer"
                  />
                </div>
                <div className="absolute top-1/2 -right-8 transform translate-x-1/2 -translate-y-1/2">
                  <Image
                    src={audioP ? "/mic.png" : "/mic-off.png"}
                    alt={audioP ? "mic" : "mic-off"}
                    width={32}
                    height={32}
                    onClick={toggleAudio}
                    className="p-1 rounded-full shadow-lg bg-white cursor-pointer"
                  />
                </div>
                <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2">
                  <Image
                    src="/phone.png"
                    alt="hang-up"
                    width={32}
                    height={32}
                    onClick={handleHangUp}
                    className="p-1 rounded-full shadow-lg bg-white cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row border p-5 rounded-lg shadow-lg bg-white">
            <div className="w-2/3 h-[300px] rounded-lg p-2 mx-2 border bg-[#38298b] text-white">
              <div className="flex justify-between mb-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border bg-white text-black rounded p-1"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="border bg-white text-black rounded p-1"
                >
                  {themes.map((themeOption) => (
                    <option key={themeOption.value} value={themeOption.value}>
                      {themeOption.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="h-[240px] overflow-hidden rounded-lg">
                <Editor
                  language={language}
                  onChange={onChangeHandler}
                  theme={theme}
                  options={{
                    selectionClipboard: false,
                    autoClosingBrackets: "always",
                  }}
                  className="h-full w-full"
                />
              </div>
            </div>
            <div className="w-1/3 h-[300px] border rounded-lg p-3 shadow-md">
              <div className="flex flex-col h-full">
                <Chat socket={socket} roomId={roomId} role="sender" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidate;