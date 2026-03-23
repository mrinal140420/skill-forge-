import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Video,
  AlertCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Enrollment, useCourseExam, useEnrollments, useSubmitQuiz } from "@/hooks/useApi";

type Course = {
  id: string;
  title: string;
  progress: number;
  examEligible: boolean;
  nextExamDate: string;
  examModuleId: string;
};

const EXAM_DURATION_SECONDS = 300;
const MAX_VIOLATIONS = 3;
const SCREENSHOT_BLACKOUT_SECONDS = 8;
const MONITOR_INTERVAL_MS = 1400;

type ProctoringViolationCode =
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "HEAD_MOVEMENT"
  | "PHONE_DETECTED"
  | "TAB_SWITCH"
  | "WINDOW_FOCUS_CHANGE"
  | "COPY_ATTEMPT"
  | "CUT_ATTEMPT"
  | "PASTE_ATTEMPT"
  | "RIGHT_CLICK"
  | "ESC_PRESSED"
  | "SCREENSHOT_ATTEMPT"
  | "DEVTOOLS_ATTEMPT"
  | "ALT_TAB_ATTEMPT"
  | "NAVIGATION_ATTEMPT"
  | "BLOCKED_SHORTCUT";

type Question = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
};

const fallbackExamQuestions: Question[] = [
  {
    id: "q-1",
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(n log n)"],
    correct: 1,
  },
  {
    id: "q-2",
    question: "Which data structure uses LIFO principle?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    correct: 1,
  },
  {
    id: "q-3",
    question: "What is the main advantage of hash tables?",
    options: ["Sorting", "O(1) average lookup", "Memory efficiency", "Cache friendliness"],
    correct: 1,
  },
];

export const ExamProctoring: FC = () => {
  const navigate = useNavigate();
  const { data: enrollments = [], isLoading } = useEnrollments();
  const submitQuiz = useSubmitQuiz();
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const examVideoRef = useRef<HTMLVideoElement | null>(null);
  const monitorBusyRef = useRef(false);
  const lastFaceCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastAlertAtRef = useRef<Record<string, number>>({});
  const faceDetectorRef = useRef<any>(null);
  const objectDetectorRef = useRef<any>(null);
  const violationsRef = useRef(0);
  const transitionToRulesRef = useRef(false);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previousFrameSignatureRef = useRef<number[] | null>(null);
  const phoneSuspicionStreakRef = useRef(0);
  const headMovementStreakRef = useRef(0);
  const offCenterStreakRef = useRef(0);
  const examFinishedRef = useRef(false);

  const [showCameraCheck, setShowCameraCheck] = useState(false);
  const [showExamRules, setShowExamRules] = useState(false);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [cameraConsent, setCameraConsent] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showExam, setShowExam] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [violations, setViolations] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [proctorStatus, setProctorStatus] = useState("AI monitor active");
  const [monitoringMode, setMonitoringMode] = useState<"ai" | "basic">("basic");
  const [monitoringEvents, setMonitoringEvents] = useState<string[]>([]);
  const [blackoutUntil, setBlackoutUntil] = useState<number | null>(null);
  const [blackoutCountdown, setBlackoutCountdown] = useState(0);
  const examQuery = useCourseExam(selectedCourse?.id, !!selectedCourse);
  const examQuestions = useMemo<Question[]>(() => {
    const questions = examQuery.data?.questions || [];
    if (questions.length === 0) {
      return fallbackExamQuestions;
    }
    return questions.map((question, index) => ({
      id: question.id || `q-${index + 1}`,
      question: question.question,
      options: question.options || [],
      correct: Number(question.correctAnswerIndex ?? 0),
      explanation: question.explanation,
    }));
  }, [examQuery.data]);
  const examDurationSeconds = examQuery.data?.durationSeconds || EXAM_DURATION_SECONDS;

  const enrolledCourses = useMemo(() => {
    const typed = enrollments as Enrollment[];
    return typed.map((entry) => {
      const modules = entry.course?.modules || [];
      const fallbackModuleId = entry.currentModuleId || modules[0]?.id || "1";
      const examModuleId = modules.length > 0 ? modules[modules.length - 1].id : fallbackModuleId;
      const progress = Math.max(0, Math.min(100, Number(entry.progress || 0)));
      return {
        id: String(entry.courseId),
        title: entry.courseTitle,
        progress,
        examEligible: progress >= 100,
        nextExamDate: progress >= 100 ? "Any time" : "Locked until 100% watched",
        examModuleId,
      } as Course;
    });
  }, [enrollments]);

  // Attach camera stream to preview and exam video elements
  useEffect(() => {
    if (cameraStream && previewVideoRef.current) {
      previewVideoRef.current.srcObject = cameraStream;
    }
    if (cameraStream && examVideoRef.current) {
      examVideoRef.current.srcObject = cameraStream;
      examVideoRef.current.play().catch(() => undefined);
    }
  }, [cameraStream, showExam, showCameraCheck]);

  // Timer
  useEffect(() => {
    if (!showExam) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExam, examDurationSeconds]);

  useEffect(() => {
    if (!showExam || !cameraEnabled) return;

    const intervalId = window.setInterval(() => {
      runAIMonitoringCheck();
    }, MONITOR_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      lastFaceCenterRef.current = null;
      monitorBusyRef.current = false;
      phoneSuspicionStreakRef.current = 0;
      headMovementStreakRef.current = 0;
      offCenterStreakRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExam, cameraEnabled, cameraStream]);

  // Stop camera stream helper
  const stopCameraStream = () => {
    if (previewVideoRef.current?.srcObject) {
      const stream = previewVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      previewVideoRef.current.srcObject = null;
    }
    if (examVideoRef.current?.srcObject) {
      examVideoRef.current.srcObject = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }
    setCameraStream(null);
    previousFrameSignatureRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Real camera access
  const handleEnableCamera = async () => {
    try {
      console.log("Requesting camera access...");
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      console.log("Camera stream obtained:", stream);
      setCameraStream(stream);
      setCameraEnabled(true);
      console.log("Camera enabled state set");
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError(
        "Camera access denied. Please allow camera permission to continue."
      );
      setCameraEnabled(false);
      stopCameraStream();
    }
  };

  const handleDisableCamera = () => {
    stopCameraStream();
    setCameraEnabled(false);
  };

  const handleStartExam = (course: Course) => {
    if (!course.examEligible) return;
    setSelectedCourse(course);
    setCameraError("");
    setSubmitError("");
    setIsCancelled(false);
    setCancelReason("");
    setViolations(0);
    violationsRef.current = 0;
    examFinishedRef.current = false;
    setCameraConsent(false);
    setRulesAccepted(false);
    setMonitoringEvents([]);
    setProctorStatus("Preparing AI monitor...");
    setMonitoringMode("basic");
    setShowCameraCheck(true);
  };

  const handleAnswerQuestion = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestion] = optionIndex;
      return next;
    });
  };

  const finalizeExam = async (cancelled: boolean, reason?: string) => {
    if (examFinishedRef.current) return;
    examFinishedRef.current = true;

    setShowExam(false);
    handleDisableCamera();
    setIsCancelled(cancelled);
    setCancelReason(reason || "");

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    }

    let correctAnswers = 0;
    answers.forEach((answer, idx) => {
      if (answer === examQuestions[idx].correct) {
        correctAnswers++;
      }
    });

    const scorePercentage = Math.round((correctAnswers / examQuestions.length) * 100);
    setScore(cancelled ? 0 : scorePercentage);

    if (selectedCourse) {
      try {
        const normalizedReason = reason || cancelReason || "";
        await submitQuiz.mutateAsync({
          courseId: selectedCourse.id,
          moduleId: selectedCourse.examModuleId,
          selectedAnswers: answers.map((answer) => (answer === undefined ? null : answer)),
          timeTakenSec: examDurationSeconds - timeLeft,
          proctoringConfirmed: true,
          proctoringViolationCount: violationsRef.current,
          proctoringFailed: cancelled,
          proctoringFailureReason: cancelled ? normalizedReason : null,
        });
      } catch (error: any) {
        const message = error?.response?.data?.error || "Exam submission failed on server";
        setSubmitError(message);
      }
    }

    setShowResults(true);
  };

  const formatViolationReason = (code: ProctoringViolationCode, message: string) => `${code}: ${message}`;

  const registerViolation = (code: ProctoringViolationCode, message: string) => {
    if (examFinishedRef.current) return;
    const reason = formatViolationReason(code, message);
    const next = violationsRef.current + 1;
    violationsRef.current = next;
    setViolations(next);
    if (next >= MAX_VIOLATIONS) {
      setCancelReason(reason);
      void finalizeExam(true, reason);
    }
  };

  const addMonitoringEvent = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMonitoringEvents((prev) => [`${timestamp} • ${message}`, ...prev].slice(0, 5));
  };

  const triggerScreenshotBlackout = () => {
    const until = Date.now() + SCREENSHOT_BLACKOUT_SECONDS * 1000;
    setBlackoutUntil(until);
    setBlackoutCountdown(SCREENSHOT_BLACKOUT_SECONDS);
  };

  useEffect(() => {
    if (!showExam || !blackoutUntil) return;

    const timer = window.setInterval(() => {
      const remainingMs = blackoutUntil - Date.now();
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
      setBlackoutCountdown(remainingSeconds);
      if (remainingSeconds <= 0) {
        setBlackoutUntil(null);
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, [showExam, blackoutUntil]);

  const getAlertCooldownMs = (key: string) => {
    if (key === "head_movement" || key === "motion_detected") return 2500;
    if (key === "phone_detected" || key === "phone_fallback") return 2000;
    if (key === "face_missing" || key === "multiple_faces") return 2000;
    if (key === "navigation_attempt") return 1200;
    return 8000;
  };

  const throttledAlert = (key: string, code: ProctoringViolationCode, message: string, asViolation = true) => {
    const now = Date.now();
    const last = lastAlertAtRef.current[key] || 0;
    const cooldownMs = getAlertCooldownMs(key);
    if (now - last < cooldownMs) return;
    lastAlertAtRef.current[key] = now;
    setProctorStatus(message);
    addMonitoringEvent(message);
    if (asViolation) {
      registerViolation(code, message);
    }
  };

  const analyzeFrameMotion = (videoEl: HTMLVideoElement) => {
    const canvas = analysisCanvasRef.current || document.createElement("canvas");
    analysisCanvasRef.current = canvas;
    canvas.width = 96;
    canvas.height = 72;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const signature: number[] = [];
    const lowerHalfMarker: boolean[] = [];
    const samplingStep = 2;

    for (let y = 0; y < canvas.height; y += samplingStep) {
      for (let x = 0; x < canvas.width; x += samplingStep) {
        const index = (y * canvas.width + x) * 4;
        signature.push((data[index] + data[index + 1] + data[index + 2]) / 3);
        lowerHalfMarker.push(y >= canvas.height * 0.58);
      }
    }

    const previous = previousFrameSignatureRef.current;
    previousFrameSignatureRef.current = signature;
    if (!previous || previous.length !== signature.length) {
      return;
    }

    let changed = 0;
    let changedLowerHalf = 0;
    let lowerHalfSamples = 0;
    for (let index = 0; index < signature.length; index++) {
      const isLowerHalf = lowerHalfMarker[index];
      if (isLowerHalf) {
        lowerHalfSamples++;
      }
      if (Math.abs(signature[index] - previous[index]) > 22) {
        changed++;
        if (isLowerHalf) {
          changedLowerHalf++;
        }
      }
    }

    const changeRatio = changed / Math.max(signature.length, 1);
    const lowerHalfChangeRatio = changedLowerHalf / Math.max(lowerHalfSamples, 1);

    return {
      changeRatio,
      lowerHalfChangeRatio,
    };
  };

  const runAIMonitoringCheck = async () => {
    if (!showExam || !cameraEnabled || !cameraStream || monitorBusyRef.current) return;
    const videoEl = examVideoRef.current;
    if (!videoEl || videoEl.readyState < 2) return;

    monitorBusyRef.current = true;
    try {
      const motion = analyzeFrameMotion(videoEl);

      const win = window as any;
      if (!faceDetectorRef.current && win.FaceDetector) {
        faceDetectorRef.current = new win.FaceDetector({ maxDetectedFaces: 3, fastMode: true });
      }
      if (!objectDetectorRef.current && win.ObjectDetector) {
        objectDetectorRef.current = new win.ObjectDetector({
          maxDetectedObjects: 5,
          fastMode: true,
          scoreThreshold: 0.5,
        });
      }

      if (faceDetectorRef.current) {
        setMonitoringMode("ai");
        const faces = await faceDetectorRef.current.detect(videoEl);

        if (!faces || faces.length === 0) {
          throttledAlert("face_missing", "NO_FACE", "No face visible. Keep your face in camera.");
          monitorBusyRef.current = false;
          return;
        }

        if (faces.length > 1) {
          throttledAlert("multiple_faces", "MULTIPLE_FACES", "Multiple faces detected. Only candidate should be present.");
          monitorBusyRef.current = false;
          return;
        }

        const box = faces[0].boundingBox;
        const center = {
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
        };

        if (lastFaceCenterRef.current) {
          const dx = Math.abs(center.x - lastFaceCenterRef.current.x);
          const dy = Math.abs(center.y - lastFaceCenterRef.current.y);
          const movementRatio = Math.max(dx / Math.max(videoEl.videoWidth, 1), dy / Math.max(videoEl.videoHeight, 1));
          if (movementRatio > 0.12) {
            headMovementStreakRef.current += 1;
            if (headMovementStreakRef.current >= 2) {
              throttledAlert("head_movement", "HEAD_MOVEMENT", "Excessive head movement detected. Stay centered.", true);
              headMovementStreakRef.current = 0;
            }
          } else {
            headMovementStreakRef.current = Math.max(0, headMovementStreakRef.current - 1);
          }
        }

        const videoCenterX = Math.max(videoEl.videoWidth, 1) / 2;
        const videoCenterY = Math.max(videoEl.videoHeight, 1) / 2;
        const centerOffsetX = Math.abs(center.x - videoCenterX) / Math.max(videoEl.videoWidth, 1);
        const centerOffsetY = Math.abs(center.y - videoCenterY) / Math.max(videoEl.videoHeight, 1);
        if (Math.max(centerOffsetX, centerOffsetY) > 0.30) {
          offCenterStreakRef.current += 1;
          if (offCenterStreakRef.current >= 2) {
            throttledAlert("off_center", "HEAD_MOVEMENT", "Face moved too far from center. Keep your face fully centered.", true);
            offCenterStreakRef.current = 0;
          }
        } else {
          offCenterStreakRef.current = 0;
        }

        lastFaceCenterRef.current = center;
        setProctorStatus("Face verified. AI monitoring active.");

        if (objectDetectorRef.current) {
          try {
            const objects = await objectDetectorRef.current.detect(videoEl);
            const phoneDetected = (objects || []).some((obj: any) => {
              const label = String(obj?.detectedObject || obj?.class || obj?.label || "").toLowerCase();
              return label.includes("phone") || label.includes("mobile") || label.includes("cell");
            });
            if (phoneDetected) {
              phoneSuspicionStreakRef.current = 0;
              throttledAlert("phone_detected", "PHONE_DETECTED", "Mobile device detected near candidate.");
            }
          } catch {
            // Ignore unsupported object detection runtime failures
          }
        }

        if (motion) {
          if (motion.changeRatio > 0.17) {
            throttledAlert("motion_detected", "HEAD_MOVEMENT", "Sudden movement or new object detected in camera frame.", true);
          }

          if (motion.lowerHalfChangeRatio > 0.24 && motion.changeRatio > 0.15) {
            phoneSuspicionStreakRef.current += 1;
            if (phoneSuspicionStreakRef.current >= 2) {
              throttledAlert("phone_fallback", "PHONE_DETECTED", "Possible mobile/object usage detected near hands.");
              phoneSuspicionStreakRef.current = 0;
            }
          } else {
            phoneSuspicionStreakRef.current = 0;
          }
        }
      } else {
        setMonitoringMode("basic");
        setProctorStatus("Basic proctoring active (camera + activity restrictions).");
      }
    } catch {
      setMonitoringMode("basic");
      setProctorStatus("AI monitor temporarily unavailable. Basic proctoring active.");
    } finally {
      monitorBusyRef.current = false;
    }
  };

  const handleSubmitExam = () => {
    finalizeExam(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Proctoring restrictions while exam is active
  useEffect(() => {
    if (!showExam) return;

    document.documentElement.requestFullscreen?.().catch(() => undefined);
    window.history.pushState({ examLocked: true }, "", window.location.href);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerViolation("TAB_SWITCH", "Tab or window switch detected");
      }
    };

    const handleWindowBlur = () => registerViolation("WINDOW_FOCUS_CHANGE", "Window focus change detected");

    const handlePopState = () => {
      window.history.pushState({ examLocked: true }, "", window.location.href);
      throttledAlert("navigation_attempt", "NAVIGATION_ATTEMPT", "Back/forward navigation attempt blocked during exam", true);
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
      throttledAlert("navigation_attempt", "NAVIGATION_ATTEMPT", "Attempt to leave or reload exam page detected", true);
      return "";
    };

    const handleDocumentClickCapture = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]");
      if (anchor) {
        event.preventDefault();
        event.stopPropagation();
        throttledAlert("navigation_attempt", "NAVIGATION_ATTEMPT", "Navigation via sidebar/menu blocked during exam", true);
      }
    };

    const preventAction = (event: Event, code: ProctoringViolationCode, reason: string) => {
      event.preventDefault();
      registerViolation(code, reason);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const blockedCtrlKeys = ["c", "v", "x", "a", "s", "p"];
      const isCtrlBlocked = (event.ctrlKey || event.metaKey) && blockedCtrlKeys.includes(key);

      if (key === "printscreen") {
        event.preventDefault();
        triggerScreenshotBlackout();
        registerViolation("SCREENSHOT_ATTEMPT", "Screenshot key detected. Screen blocked temporarily.");
        return;
      }

      if (key === "escape") {
        event.preventDefault();
        registerViolation("ESC_PRESSED", "ESC key blocked during exam.");
        return;
      }

      if (key === "f12") {
        event.preventDefault();
        registerViolation("DEVTOOLS_ATTEMPT", "Developer tools shortcut blocked.");
        return;
      }

      if (event.altKey && key === "tab") {
        event.preventDefault();
        registerViolation("ALT_TAB_ATTEMPT", "Alt+Tab blocked during exam.");
        return;
      }

      if (isCtrlBlocked) {
        event.preventDefault();
        registerViolation("BLOCKED_SHORTCUT", `Blocked shortcut detected: ${event.key}`);
      }
    };

    const handleCopy = (event: Event) => preventAction(event, "COPY_ATTEMPT", "Copy action detected");
    const handleCut = (event: Event) => preventAction(event, "CUT_ATTEMPT", "Cut action detected");
    const handlePaste = (event: Event) => preventAction(event, "PASTE_ATTEMPT", "Paste action detected");
    const handleContextMenu = (event: Event) => preventAction(event, "RIGHT_CLICK", "Right-click detected");

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleDocumentClickCapture, true);

    return () =>
      {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("blur", handleWindowBlur);
        window.removeEventListener("popstate", handlePopState);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        document.removeEventListener("copy", handleCopy);
        document.removeEventListener("cut", handleCut);
        document.removeEventListener("paste", handlePaste);
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("click", handleDocumentClickCapture, true);
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExam]);

  // ======= EXAM VIEW =======
  if (showExam && selectedCourse) {
    const q = examQuestions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
        {blackoutUntil && blackoutCountdown > 0 && (
          <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 text-sm font-semibold uppercase tracking-wide">Screenshot Attempt Blocked</p>
              <p className="text-white text-lg mt-2">Screen access restricted for {blackoutCountdown}s</p>
              <p className="text-gray-400 text-sm mt-2">Any repeated violations will fail the exam.</p>
            </div>
          </div>
        )}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gray-900 border-gray-700 mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <div className="rounded-lg overflow-hidden border border-gray-700 bg-black relative aspect-video">
                    <video
                      ref={examVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      LIVE PROCTOR FEED
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">AI Proctor Status</p>
                    <Badge className={monitoringMode === "ai" ? "bg-emerald-600" : "bg-amber-600"}>
                      {monitoringMode === "ai" ? "AI Vision" : "Basic Monitor"}
                    </Badge>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded p-3 text-sm text-gray-100">
                    {proctorStatus}
                  </div>
                  <div className="space-y-1">
                    {monitoringEvents.length === 0 ? (
                      <p className="text-xs text-gray-400">No alerts. Candidate behavior normal.</p>
                    ) : (
                      monitoringEvents.map((event, idx) => (
                        <p key={idx} className="text-xs text-amber-300">• {event}</p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">{selectedCourse.title}</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">
                    Question {currentQuestion + 1} of {examQuestions.length}
                  </p>
                </div>

                <div className="text-right">
                  <div
                    className={`text-2xl font-bold flex items-center gap-2 ${
                      timeLeft < 60 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    <Clock className="h-5 w-5" />
                    {formatTime(timeLeft)}
                  </div>

                  {violations > 0 && (
                    <div className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Violations: {violations}/{MAX_VIOLATIONS}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gray-900 border-gray-700 mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-6 text-white">{q.question}</h2>

              <div className="space-y-3">
                {q.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerQuestion(idx)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      answers[currentQuestion] === idx
                        ? "border-blue-500 bg-blue-500/20 text-white"
                        : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span>{" "}
                    {option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
              disabled={currentQuestion === 0}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Previous
            </Button>

            <div className="flex gap-2 flex-wrap justify-center">
              {examQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-10 h-10 rounded flex items-center justify-center font-semibold transition ${
                    currentQuestion === idx
                      ? "bg-blue-500 text-white"
                      : answers[idx] !== undefined
                      ? "bg-green-500/30 border border-green-500 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentQuestion === examQuestions.length - 1 ? (
              <Button
                onClick={handleSubmitExam}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Submit Exam
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentQuestion((p) => Math.min(examQuestions.length - 1, p + 1))
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ======= RESULTS VIEW =======
  if (showResults) {
    const correctCount = answers.filter(
      (answer, idx) => answer === examQuestions[idx].correct
    ).length;
    const isPassed = !isCancelled && score >= 70;

    const scoreColor = isCancelled
      ? "text-amber-600"
      : isPassed
      ? "text-emerald-600"
      : "text-red-600";

    const scoreBg = isCancelled
      ? "bg-amber-50 border-amber-200"
      : isPassed
      ? "bg-emerald-50 border-emerald-200"
      : "bg-red-50 border-red-200";

    const badgeBg = isCancelled
      ? "bg-amber-100 text-amber-800"
      : isPassed
      ? "bg-emerald-100 text-emerald-800"
      : "bg-red-100 text-red-800";

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header hero card */}
          <Card className={`border-0 shadow-xl overflow-hidden`}>
            <div className={`${scoreBg} border-b px-8 py-10 text-center`}>
              {/* Score ring */}
              <div className="relative inline-flex items-center justify-center mb-5">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={isCancelled ? "#d97706" : isPassed ? "#10b981" : "#ef4444"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - (isCancelled ? 0 : score) / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className={`text-4xl font-extrabold ${scoreColor}`}>
                    {isCancelled ? "—" : `${score}%`}
                  </div>
                  <div className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">SCORE</div>
                </div>
              </div>

              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${badgeBg}`}>
                {isCancelled ? "Exam Cancelled" : isPassed ? "PASSED" : "FAILED"}
              </span>

              <h1 className={`text-3xl font-bold mb-2 ${scoreColor}`}>
                {isCancelled ? "Exam Cancelled" : isPassed ? "Congratulations!" : "Better Luck Next Time"}
              </h1>
              <p className="text-slate-600 text-base max-w-lg mx-auto">
                {isCancelled
                  ? `Your exam was cancelled due to a proctoring violation: ${cancelReason || "Policy breach"}`
                  : isPassed
                  ? `You scored ${score}% — ${correctCount} out of ${examQuestions.length} questions answered correctly.`
                  : `You scored ${score}% — ${correctCount} out of ${examQuestions.length} correct. A minimum of 70% is required to pass.`}
              </p>
              {submitError && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 inline-block">
                  Server: {submitError}
                </p>
              )}
            </div>

            {/* Stat row */}
            <CardContent className="p-0">
              <div className="grid grid-cols-3 divide-x divide-slate-100">
                <div className="flex flex-col items-center py-5 gap-1">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-1" />
                  <span className="text-2xl font-bold text-emerald-600">{correctCount}</span>
                  <span className="text-xs text-slate-500 font-medium">Correct</span>
                </div>
                <div className="flex flex-col items-center py-5 gap-1">
                  <AlertCircle className="h-6 w-6 text-red-400 mb-1" />
                  <span className="text-2xl font-bold text-red-500">{examQuestions.length - correctCount}</span>
                  <span className="text-xs text-slate-500 font-medium">Incorrect</span>
                </div>
                <div className="flex flex-col items-center py-5 gap-1">
                  <Clock className="h-6 w-6 text-purple-500 mb-1" />
                  <span className="text-2xl font-bold text-purple-600">{formatTime(examDurationSeconds - timeLeft)}</span>
                  <span className="text-xs text-slate-500 font-medium">Time Used</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question review */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-transparent">
              <CardTitle className="text-slate-900 text-lg">Question Review</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-3">
                {examQuestions.map((q, idx) => {
                  const isCorrect = answers[idx] === q.correct;

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 ${
                        isCancelled
                          ? "bg-slate-50 border-slate-200"
                          : isCorrect
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {isCancelled ? (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          ) : isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isCancelled ? "bg-slate-200 text-slate-600"
                              : isCorrect ? "bg-emerald-200 text-emerald-800"
                              : "bg-red-200 text-red-800"
                            }`}>
                              Q{idx + 1}
                            </span>
                            <span className={`text-xs font-semibold ${
                              isCancelled ? "text-slate-500" : isCorrect ? "text-emerald-700" : "text-red-600"
                            }`}>
                              {isCancelled ? "Cancelled" : isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 text-sm mb-3 leading-snug">{q.question}</p>
                          <div className="space-y-1.5">
                            {q.options.map((option, optIdx) => {
                              const isUserChoice = answers[idx] === optIdx;
                              const isRightAnswer = q.correct === optIdx;
                              let optionClass = "border-slate-200 text-slate-600";
                              if (!isCancelled && isRightAnswer) optionClass = "border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold";
                              else if (!isCancelled && isUserChoice && !isCorrect) optionClass = "border-red-400 bg-red-50 text-red-800 line-through";
                              return (
                                <div key={optIdx} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${optionClass}`}>
                                  <span className="font-bold shrink-0 w-4">{String.fromCharCode(65 + optIdx)}.</span>
                                  <span>{option}</span>
                                  {!isCancelled && isRightAnswer && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 ml-auto shrink-0" />
                                  )}
                                  {!isCancelled && isUserChoice && !isCorrect && (
                                    <AlertCircle className="h-3.5 w-3.5 text-red-500 ml-auto shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {q.explanation && !isCancelled && (
                            <p className="mt-3 text-xs text-slate-500 bg-slate-100 rounded px-3 py-2 border border-slate-200">
                              💡 {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pb-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowResults(false);
                setSelectedCourse(null);
                setCameraConsent(false);
                setRulesAccepted(false);
                setCurrentQuestion(0);
                setAnswers([]);
                setViolations(0);
                violationsRef.current = 0;
                setMonitoringEvents([]);
              }}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 px-8"
            >
              Take Another Exam
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            >
              Back to Dashboard
            </Button>
          </div>

        </div>
      </div>
    );
  }

  // ======= LIST VIEW =======
  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 p-8">
      <div>
        <h1 className="text-3xl font-bold">Take an Exam</h1>
        <p className="text-muted-foreground">Eligible courses for proctored exams</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading your enrolled courses...</p>}

      {!isLoading && enrolledCourses.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No enrolled courses found. Enroll and complete content to unlock exams.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrolledCourses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between gap-3">
                <span className="text-lg">{course.title}</span>
                {course.examEligible ? (
                  <Badge className="bg-green-600">Eligible</Badge>
                ) : (
                  <Badge variant="secondary">Locked</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {`Next exam: ${course.nextExamDate}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Course Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {course.progress}%
                  </span>
                </div>
                <Progress value={course.progress} />
              </div>

              {course.examEligible ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>All course modules watched (100%)</span>
                  </div>
                  <Button className="w-full" onClick={() => handleStartExam(course)}>
                    Start Exam
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>Complete {100 - course.progress}% more to be eligible</span>
                  </div>
                  <Button disabled className="w-full">
                    Locked - {100 - course.progress}% Remaining
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Camera Check Dialog */}
      <Dialog
        open={showCameraCheck}
        onOpenChange={(open) => {
          setShowCameraCheck(open);
          if (!open && !transitionToRulesRef.current) {
            // if user closes dialog, stop camera
            handleDisableCamera();
          }
        }}
      >
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Camera & Permission Check</DialogTitle>
            <DialogDescription>
              We need access to your camera for proctoring. Please grant camera permission when prompted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {cameraError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm flex gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Permission Denied</p>
                  <p>{cameraError}</p>
                  <p className="text-xs mt-1">Please check your browser permissions and try again.</p>
                </div>
              </div>
            )}

            {cameraEnabled && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm flex gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Camera Enabled ✓</p>
                  <p>Your camera is now active and ready for the exam.</p>
                </div>
              </div>
            )}

            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border overflow-hidden bg-gray-900 relative">
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover absolute inset-0 ${
                  cameraEnabled && cameraStream ? "opacity-100" : "opacity-0"
                }`}
              />
              {!cameraEnabled || !cameraStream ? (
                <div className="text-center relative z-10">
                  <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {!cameraEnabled ? "Camera preview will appear here" : "Loading camera..."}
                  </p>
                </div>
              ) : null}
            </div>

            <Button
              className="w-full"
              onClick={cameraEnabled ? handleDisableCamera : handleEnableCamera}
              variant={cameraEnabled ? "destructive" : "default"}
            >
              {cameraEnabled ? "Disable Camera" : "Enable Camera & Request Permission"}
            </Button>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm">
              <p className="text-xs font-semibold mb-1">NEXT STEPS:</p>
              <ol className="text-xs space-y-1 list-decimal list-inside">
                <li>Click "Enable Camera & Request Permission" above</li>
                <li>Grant camera access when browser prompts you</li>
                <li>Check the agreement box below</li>
                <li>Click "Continue to Exam Rules"</li>
              </ol>
            </div>

            <div className="border-t pt-4 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={cameraConsent}
                  onChange={(e) => setCameraConsent(e.target.checked)}
                  className="rounded"
                />
                <span>I agree to camera-based proctoring and understand the exam rules</span>
              </label>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!cameraEnabled || !cameraConsent}
              onClick={() => {
                transitionToRulesRef.current = true;
                setShowCameraCheck(false);
                setShowExamRules(true);
                window.setTimeout(() => {
                  transitionToRulesRef.current = false;
                }, 0);
              }}
            >
              Continue to Exam Rules →
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exam Rules Dialog */}
      <Dialog open={showExamRules} onOpenChange={setShowExamRules}>
        <DialogContent
          className="max-w-2xl"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Exam Rules & Proctoring</DialogTitle>
            <DialogDescription>
              Please review and accept the rules before starting
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security Measures</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>✓ Fullscreen mode is mandatory</p>
                <p>✓ No tab/window switch allowed</p>
                <p>✓ No copy/paste/cut/right-click allowed</p>
                <p>✓ No ESC / PrintScreen / F12 / Alt+Tab allowed</p>
                <p>✓ Screenshot attempts trigger temporary black-screen penalty</p>
                <p>✓ Live camera feed shown during exam</p>
                <p>✓ AI checks face visibility, head movement, and phone/object detection</p>
                <p>✓ Mobile/object detection runs when browser supports AI object detector</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Violation Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>🚫 3 confirmed violations cancel the exam automatically</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Technical Requirements</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Working camera</p>
                <p>• Stable internet connection</p>
                <p>• Quiet, well-lit environment</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
                className="rounded"
              />
              <span>I understand and agree to all exam rules</span>
            </label>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!rulesAccepted || examQuery.isLoading}
            onClick={() => {
              setShowExamRules(false);
              setViolations(0);
              violationsRef.current = 0;
              setTimeLeft(examDurationSeconds);
              setCurrentQuestion(0);
              setAnswers(new Array(examQuestions.length).fill(undefined));
              setProctorStatus("AI proctor is actively monitoring this attempt.");
              setShowExam(true);
            }}
          >
            {examQuery.isLoading ? 'Preparing Exam...' : 'Start Exam'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};