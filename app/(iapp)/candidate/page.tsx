"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chat from "@/components/Chat";
import { Mic, MicOff, Moon, Phone, Sun, Video, VideoOff } from "lucide-react";

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
    { label: "C++", value: "cpp" },
  ];

  const themes: Theme[] = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "vs-dark" },
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
        position: "top-center",
      }
    );
  };

  const confirmHangUp = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "terminateRoom",
          roomId,
          role: "receiver",
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
        } else if (data.type === "MeetingEnded") {
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
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Your browser does not support video streaming");
      return;
    }
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
        video: true,
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
          r_link: resumeLink,
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
          content: value,
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
    <div className="container mx-auto flex flex-col">
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
      {/*Editor and video component*/}
      {roomId && (
        <div className="flex-grow flex space-x-4 h-full w-full">
          <div className="h-auto w-2/3">
            <div className="flex flex-col rounded-lg p-2 ring-1 text-white">
              <div className="flex justify-between mb-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="ring-1 bg-white text-black rounded p-1"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                <div className="flex rounded-full px-1 justify-center items-center bg-gray-500/15 p-1 relative w-16">
                  <div
                    className={`absolute w-1/2 h-full bg-yellow-500 rounded-full transition-transform duration-300 ease-in-out ${
                      theme === "light" ? "-translate-x-4" : "translate-x-4 bg-violet-600"
                    }`}
                  />
                  {themes.map((themeOption) => (
                    <button
                      className="relative flex-1 px-1"
                      key={themeOption.value}
                      onClick={() => setTheme(themeOption.value)}
                    >
                      {themeOption.label === "Light" ? (
                        <Sun color="black" />
                      ) : (
                        <Moon color={`${theme==='light'?'black':'white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="h-[450px] overflow-hidden rounded-lg">
                <Editor
                  language={language}
                  onChange={onChangeHandler}
                  theme={theme}
                  height="100%"
                  options={{
                    selectionClipboard: false,
                    autoClosingBrackets: "always",
                  }}
                  className="h-full w-full"
                />
              </div>
            </div>
            <div className="flex flex-row justify-center items-center gap-10 pt-3">
              <button
                onClick={toggleVideo}
                className="ring-1 hover:bg-blue-100 rounded-full p-3 shadow-lg flex items-center justify-center"
              >
                {videoP ? <Video color="blue" /> : <VideoOff color="blue" />}
              </button>

              <button
                onClick={toggleAudio}
                className="ring-1 hover:bg-blue-100 rounded-full p-3 shadow-lg flex items-center justify-center"
              >
                {audioP ? <Mic color="blue" /> : <MicOff color="blue" />}
              </button>

              <button
                onClick={handleHangUp}
                className="bg-red-500 hover:bg-red-600 rounded-full p-3 shadow-xl flex items-center justify-center"
              >
                <Phone color="white" />
              </button>
            </div>
          </div>

          {/* Remote Video and Chat */}
          <div className="flex flex-col justify-evenly items-center space-y-10 p-5 rounded-lg w-1/3">
            {/* Remote Video */}
            <div className="flex flex-col items-center w-full">
              {/* TODO:Add name */}
              <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border-2 border-blue-600 shadow-lg">
                <video
                  autoPlay
                  ref={vRef}
                  className="w-full h-full object-cover"
                />
                <audio ref={aRef} autoPlay />
                <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  <div className="inline-block h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Connected
                </div>
              </div>
            </div>

            {/* Local Video */}
            <div className="flex flex-col items-center w-full">
              <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                <video
                  autoPlay
                  muted
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  You
                </div>
              </div>
            </div>
          </div>

          <Chat socket={socket} roomId={roomId} role="sender" />
        </div>
      )}
    </div>
  );
};

export default Candidate;
