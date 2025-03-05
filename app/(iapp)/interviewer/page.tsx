"use client";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Editor from "@monaco-editor/react";
import Chat from "@/components/Chat";
import { useRouter } from "next/navigation";

import {
  Disc,
  FileUser,
  Mic,
  MicOff,
  Phone,
  Video,
  VideoOff,
} from "lucide-react";
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
    pcRef.current?.close();
    pcRef.current = null;
    vRef.current = null;
    localVideoRef.current = null;
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
                candidate: event.candidate,
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
          video: true,
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
            sdp: pc.localDescription,
          })
        );
      } else if (message.type === "iceCandidate" && pcRef) {
        if (pcRef.current) {
          pcRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
      } else if (message.type === "editorContent") {
        setValue(message.content);
      } else if (message.type === "participantLeft") {
        toast.warn("Candidate left the meeting");
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
  };
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
          frameRate: 30,
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      // microphone access
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
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
        ...(remoteAudioTrack ? [remoteAudioTrack] : []),
      ]);

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp8,opus",
        videoBitsPerSecond: 3000000, // 3 Mbps
        audioBitsPerSecond: 128000, // 128 kbps
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
    <div className="container mx-auto flex flex-col">
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

      {isModalOpen2 && (
        <ResumeViewer
          isOpen={isModalOpen2}
          onClose={() => setIsModalOpen2(false)}
          resumeLink={resumeLink}
        />
      )}

      {roomId && (
        <div className="flex-grow flex space-x-4 h-full w-full">
          {/* <p>Room Id: {roomId}</p> */}
          <div className="flex flex-col w-1/3 rounded-lg">
            <div className="h-[390px] ring-1 rounded-lg p-2 mx-2">
              <Editor
                value={value}
                theme="light"
                className="h-full"
                options={{
                  readOnly: true,
                  "semanticHighlighting.enabled": "configuredByTheme",
                  fontSize: 11.5,
                  minimap:{enabled:false}
                }}
              />
            </div>
            <div className="flex flex-row justify-center items-center gap-10 pt-3">
              <button
                onClick={toggleVideo}
                className={`${
                  isRecording ? "bg-red-600 animate-pulse" : ""
                } hover:bg-red-200 ring-1 rounded-full p-3 shadow-lg flex items-center justify-center `}
              >
                {!isRecording ? (
                  <Disc color="red" onClick={startScreenRecording} />
                ) : (
                  <Disc
                    color="white"
                    className="bg-red-600"
                    onClick={stopRecording}
                  />
                )}
              </button>
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
          <div className="flex w-2/3">

            <div className="flex flex-col justify-center items-baseline space-y-10 rounded-lg w-2/6">
              {/* Remote Video */}
              <div className="flex flex-col items-center w-2/3">
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
              <div className="flex flex-col items-center w-2/3">
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
            <div className="grid grid-flow-2 ring-1 w-4/6">
              {resumeLink && (
                <div>
                  <button onClick={viewResume}>
                    <FileUser />
                  </button>
                </div>
              )}
            </div>
            <Chat socket={socket} roomId={roomId} role="receiver" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviewer;
