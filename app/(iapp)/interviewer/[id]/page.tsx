"use client";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Editor from "@monaco-editor/react";
import Chat from "@/components/Chat";
import { useParams, useRouter } from "next/navigation";

import {
  Disc2,
  FileUser,
  Mic,
  MicOff,
  Phone,
  Video,
  VideoOff,
} from "lucide-react";
import { ResumeViewer } from "@/components/ResumeViewer";
import ResumeAnalysis from "@/components/ResumeAnalysis";
import InterviewerFeedbackForm from "@/components/InterviewerFeedbackForm";
import { getUserDets } from "@/lib/actions";

const Interviewer = () => {
  const params = useParams();
  const roomId = params.id as string;

  const vRef = useRef<HTMLVideoElement | null>(null);
  const aRef = useRef<HTMLAudioElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [resumeLink, setResumeLink] = useState<string>("");

  const [isModalOpen2, setIsModalOpen2] = useState<boolean>(false);
  const [value, setValue] = useState("");
  const [audioP, setAudioP] = useState<boolean>(true);
  const [videoP, setvideoP] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamsRef = useRef<MediaStream[]>([]);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const router = useRouter();

  const [candidateDetails, setCandidateDetails] = useState(null);

  useEffect(() => {
    if (!roomId) return;
    const fetchData = async () => {
      try {
        const data = await getUserDets(roomId);
        setCandidateDetails(data);
      } catch (error) {
        console.error("Failed to fetch candidate details:", error);
      }
    };
    fetchData();
  }, []);

  //cleanup funcyion for connections
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
    if (
      screenRecorderRef.current &&
      screenRecorderRef.current.state === "recording"
    ) {
      stopRecording();
    }
    cleanupRecording();
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

    pcRef.current?.close();
    pcRef.current = null;
    vRef.current = null;
    localVideoRef.current = null;
    router.push("/");
  };

  useEffect(() => {
    if (!roomId) return;
    const socket = new WebSocket("wss://ointerview-node.onrender.com/");
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
                  minimap: { enabled: false },
                }}
              />
            </div>
            <div className="flex flex-row justify-center items-center gap-10 pt-3">
              <div
                className={`${
                  isRecording ? "bg-red-600 animate-pulse" : ""
                } hover:bg-red-200 ring-1 rounded-full p-3 shadow-lg flex items-center justify-center `}
                title="Record"
              >
                {!isRecording ? (
                  <Disc2 color="red" onClick={startScreenRecording} />
                ) : (
                  <Disc2
                    color="white"
                    className="bg-red-600"
                    onClick={stopRecording}
                  />
                )}
              </div>

              <button
                onClick={toggleVideo}
                className="ring-1 hover:bg-blue-100 rounded-full p-3 shadow-lg flex items-center justify-center"
                title={videoP ? "Video-on" : "Video-off"}
              >
                {videoP ? <Video color="blue" /> : <VideoOff color="blue" />}
              </button>

              <button
                onClick={toggleAudio}
                className="ring-1 hover:bg-blue-100 rounded-full p-3 shadow-lg flex items-center justify-center"
                title={audioP ? "Audio-on" : "Audio-off"}
              >
                {audioP ? <Mic color="blue" /> : <MicOff color="blue" />}
              </button>

              <button
                onClick={handleHangUp}
                className="bg-red-500 hover:bg-red-600 rounded-full p-3 shadow-xl flex items-center justify-center"
                title={"hang-up"}
              >
                <Phone color="white" />
              </button>
              {resumeLink && (
                <button
                  onClick={viewResume}
                  className="p-3 ring-1 rounded-full"
                  title="View-Resume"
                >
                  <FileUser color="blue" />
                </button>
              )}
            </div>
          </div>

          {/* Remote Video and Chat */}
          <div className="flex w-2/3 gap-5">
            <div className="flex flex-col justify-evenly items-baseline rounded-lg w-2/6">
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

            <div className="flex flex-row p-2 ring-1 rounded-lg w-4/6">
              {resumeLink && <ResumeAnalysis resumeLink={resumeLink} />}
            </div>
            <Chat socket={socket} roomId={roomId} role="receiver" />

            {candidateDetails && resumeLink && (
              <InterviewerFeedbackForm
                candidateDets={candidateDetails}
                resumeLink={resumeLink}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviewer;
