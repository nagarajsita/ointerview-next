'use client'
import { useEffect, useRef, useState } from "react";
import hang from "@/public/phone.png";
import mic from "@/public/mic.png";
import micC from "@/public/mic-off.png";

import video from "@/public/video.png";
import videoC from "@/public/video-off.png";

import record from "@/public/record.svg";
import recording from "@/public/rec-button.svg";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Editor from "@monaco-editor/react";
import Chat from "@/components/Chat";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FileUserIcon } from "lucide-react";
import { ResumeViewer } from "@/components/ResumeViewer";

const Interviewer = () => {
  const vRef = useRef<HTMLVideoElement | null>(null);
  const aRef = useRef<HTMLAudioElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [resumeLink, setResumeLink] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [isModalOpen2, setIsModalOpen2] = useState<boolean>(false);
  const [value, setValue] = useState("");
  const [audioP, setAudioP] = useState<boolean>(true);
  const [videoP, setvideoP] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamsRef = useRef<MediaStream[]>([]);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const router = useRouter();

  //cleanup funcyion for connections
  const cleanupConnection = () => {
    // Stop all tracks from local stream
    if (localVideoRef.current?.srcObject instanceof MediaStream) {
      localVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }
    // Stop all tracks from remote stream
    if (vRef.current?.srcObject instanceof MediaStream) {
      vRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    if (aRef.current?.srcObject instanceof MediaStream) {
      aRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    // Stop recording if active
    if (
      screenRecorderRef.current &&
      screenRecorderRef.current.state === "recording"
    ) {
      stopRecording();
    }
    // Clean up media streams
    cleanupRecording();
    // Clear references
    localVideoRef.current = null;
    vRef.current = null;
    aRef.current = null;
  };

  const handleHangUp = () => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p className="font-medium">End Interview Session?</p>
          <p className="text-sm text-gray-600 mt-1">
            This will end the session for all participants.
          </p>
          <div className="flex justify-end mt-2">
            <button
              className="bg-red-500 text-white px-3 py-1 rounded mr-2 hover:bg-red-600"
              onClick={() => {
                confirmHangUp();
                closeToast();
              }}
            >
              End Session
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
    pcRef.current?.close()
    pcRef.current=null;
    vRef.current=null
    localVideoRef.current=null
    router.push("/"); 
  };

  useEffect(() => {
    if (!roomId) return;
    const socket = new WebSocket("wss://localhost:8080");
    setSocket(socket);
    socket.onopen = () => {
      socket.send(
        JSON.stringify({ type: "joinRoom", roomId, role: "receiver" })
      );
    };
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "createOffer") {
        const pc = new RTCPeerConnection();
        pcRef.current = pc;
        setResumeLink(message.r_link);
        pc.setRemoteDescription(new RTCSessionDescription(message.sdp));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.send(
              JSON.stringify({
                type: "iceCandidate",
                roomId,
                candidate: event.candidate
              })
            );
          }
        };

        pc.ontrack = (event) => {
          console.log("Received track:", event.track.kind);
          if (event.track.kind === "video" && vRef.current) {
            vRef.current.srcObject = new MediaStream([event.track]);
          }
          if (event.track.kind === "audio" && aRef.current) {
            aRef.current.srcObject = new MediaStream([event.track]);
            aRef.current.volume = 1;
            aRef.current.play();
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
        if (pc) {
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.send(
          JSON.stringify({
            type: "createAnswer",
            roomId,
            sdp: pc.localDescription
          })
        );
      } else if (message.type === "iceCandidate" && pcRef) {
        if (pcRef.current) {
          pcRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
      } else if (message.type === "editorContent") {
        setValue(message.content);
      } else if (message.type === "participantLeft"){
        toast.warn("Candidate left the meeting")
      }
    };
    return () => {
      socket.close();
    };
  }, [roomId]);

  const handleCreateRoom = () => {
    setIsModalOpen(false);
  };

  const generateRandomRoomId = () => {
    const randomString = Math.random().toString(36).substring(2, 10);
    setRoomId(randomString);
    navigator.clipboard
      .writeText(randomString)
      .then(() => {
        toast.success("Room ID copied to clipboard!");
        handleCreateRoom();
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const toggleVideo = () => {
    if (pcRef.current && pcRef.current.getSenders()) {
      // console.log("inside if")
      const videoSender = pcRef.current
        .getSenders()
        .find((sender) => sender.track?.kind === "video");
      if (videoSender?.track) {
        videoSender.track.enabled = !videoSender.track.enabled;
        setvideoP(videoSender.track.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (pcRef.current && pcRef.current.getSenders()) {
      const audioTrack = pcRef.current
        ?.getSenders()
        .find((sender) => sender.track?.kind === "audio");
      if (audioTrack?.track) {
        audioTrack.track.enabled = !audioTrack.track.enabled;
        setAudioP(audioTrack.track.enabled);
      }
    }
  };

  const viewResume = () => {
    if (resumeLink) {
      setIsModalOpen2(true);
    } else {
      toast.error("No resume link available");
    }
  }
  const cleanupRecording = () => {
    if (mediaStreamsRef.current) {
      mediaStreamsRef.current.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      mediaStreamsRef.current = [];
    }
  };
  //recording
  const startScreenRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser", 
          frameRate: 30
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      // microphone access
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      // remote participant's audio
      let remoteAudioTrack = null;
      if (pcRef.current) {
        const receivers = pcRef.current.getReceivers();
        const audioReceiver = receivers.find(
          (receiver) => receiver.track.kind === "audio"
        );
        if (audioReceiver) {
          remoteAudioTrack = audioReceiver.track;
        }
      }
      mediaStreamsRef.current = [screenStream, micStream];
      // Combine
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...(remoteAudioTrack ? [remoteAudioTrack] : [])
      ]);

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp8,opus",
        videoBitsPerSecond: 3000000, // 3 Mbps
        audioBitsPerSecond: 128000 // 128 kbps
      });

      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        a.href = url;
        a.download = `meeting-recording-${timestamp}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        // Cleanup streams
        cleanupRecording();
      };

      // Start recording
      recorder.start(1000); // Create chunks every second
      screenRecorderRef.current = recorder;
      setIsRecording(true);

      // Add stop recording handler when user stops screen sharing
      screenStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Failed to start recording. Please make sure you have granted necessary permissions."
      );
      cleanupRecording();
    }
  };

  const stopRecording = () => {
    if (
      screenRecorderRef.current &&
      screenRecorderRef.current.state === "recording"
    ) {
      screenRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => {
      if (
        screenRecorderRef.current &&
        screenRecorderRef.current.state === "recording"
      ) {
        screenRecorderRef.current.stop();
      }
      cleanupRecording();
    };
  }, []);

  return (
    <div className="container mx-auto">
      <ToastContainer position="top-right" />
      {isModalOpen && (
        <div className="fixed inset-0 bg-blue-100 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Create a Room</h2>
            <div className="flex mb-4 px-20">
              {/* <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="border p-2 flex-grow mr-2"
              /> */}
              <button
                onClick={generateRandomRoomId}
                className="bg-green-500 text-white px-10 py-2 rounded"
              >
                Generate ID
              </button>
            </div>
          </div>
        </div>
      )}
      
      {
        isModalOpen2 && (
          <ResumeViewer isOpen={isModalOpen2} onClose={() => setIsModalOpen2(false)} resumeLink={resumeLink}/>
        )
      }

      {roomId && (
        <>
          {/* <p>Room Id: {roomId}</p> */}
          <div className="flex justify-center items-center mt-4 space-x-2">
            {!isRecording ? (
              <Image
                src={record}
                alt="Start Screen Recording"
                className="w-10 h-10 cursor-pointer"
                onClick={startScreenRecording}
              />
            ) : (
              <Image
                src={recording}
                alt="Stop Recording"
                className="w-10 h-10 cursor-pointer"
                onClick={stopRecording}
              />
            )}
            {resumeLink && <div>
              <button onClick={viewResume}>
              <FileUserIcon/>
              </button>
            </div>}
          </div>

          <div className="flex flex-row justify-evenly items-center border p-5 rounded-lg shadow-lg">
            {/* Remote Video */}
            <div className="flex flex-col items-center bg-white p-2 rounded-full shadow-md mx-4">
              <div className="relative w-32 h-32">
                <video
                  autoPlay
                  ref={vRef}
                  className="w-full h-full object-cover rounded-full shadow-md"
                />
                <audio ref={aRef} autoPlay />
              </div>
            </div>

            {/* Local Video */}
            <div className="relative flex flex-col items-center bg-white p-2 rounded-full shadow-lg mx-4">
              <div className="relative w-32 h-32">
                <video
                  autoPlay
                  muted
                  ref={localVideoRef}
                  className="w-full h-full object-cover rounded-full shadow-md"
                />

                {/* Floating Icons */}
                <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 ">
                  {videoP ? (
                    <Image
                      src={video}
                      alt="video"
                      onClick={toggleVideo}
                      className="w-8 h-8 p-1 rounded-full shadow-lg bg-white"
                    />
                  ) : (
                    <Image
                      src={videoC}
                      alt="video-close"
                      onClick={toggleVideo}
                      className="w-8 h-8 p-1 rounded-full shadow-lg bg-white"
                    />
                  )}
                </div>

                <div className="absolute top-1/2 -right-8 transform translate-x-1/2 -translate-y-1/2 ">
                  {audioP ? (
                    <Image
                      src={mic}
                      alt="mic"
                      onClick={toggleAudio}
                      className="w-8 h-8 p-1 rounded-full shadow-lg bg-white"
                    />
                  ) : (
                    <Image
                      src={micC}
                      alt="mic-off"
                      onClick={toggleAudio}
                      className="w-8 h-8 p-1 rounded-full shadow-lg bg-white"
                    />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 ">
                  <Image
                    src={hang}
                    alt="hang-up"
                    className="w-8 h-8 p-1 rounded-full shadow-lg bg-white"
                    onClick={handleHangUp}
                  />
                </div>
              </div>
            </div>
            
          </div>
          {/* code editor and chat */}
          <div className="flex flex-row border p-5 rounded-lg shadow-lg bg-white mt-1">
            <div className="w-2/3 h-[290px] rounded-lg p-2 mx-2 border bg-[#38298b] text-white">
              <Editor
                value={value}
                theme="vs-dark"
                className="h-full"
                language="html"
                options={{
                  readOnly: true,
                  "semanticHighlighting.enabled": "configuredByTheme"
                }}
              />
            </div>
            <div className="w-1/3 h-[290px] border rounded-lg p-3  shadow-md">
              <div className="flex flex-col h-full">
                <Chat socket={socket} roomId={roomId} role="receiver" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Interviewer;
