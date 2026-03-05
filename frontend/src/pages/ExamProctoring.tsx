import { FC, useEffect, useRef, useState } from "react";
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
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

type Course = {
  id: number;
  title: string;
  progress: number;
  examEligible: boolean;
  nextExamDate: string | null;
};

const enrolledCourses: Course[] = [
  {
    id: 1,
    title: "Advanced Data Structures & Algorithms",
    progress: 100,
    examEligible: true,
    nextExamDate: "2024-02-15",
  },
  {
    id: 2,
    title: "System Design Masterclass",
    progress: 75,
    examEligible: true,
    nextExamDate: "Any time",
  },
  {
    id: 3,
    title: "DBMS Fundamentals",
    progress: 45,
    examEligible: false,
    nextExamDate: null,
  },
];

type Question = {
  id: number;
  question: string;
  options: string[];
  correct: number;
};

const examQuestions: Question[] = [
  {
    id: 1,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(n log n)"],
    correct: 1,
  },
  {
    id: 2,
    question: "Which data structure uses LIFO principle?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    correct: 1,
  },
  {
    id: 3,
    question: "What is the main advantage of hash tables?",
    options: ["Sorting", "O(1) average lookup", "Memory efficiency", "Cache friendliness"],
    correct: 1,
  },
];

export const ExamProctoring: FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
  const [timeLeft, setTimeLeft] = useState(300); // 5 min
  const [violations, setViolations] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Attach camera stream to video element
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      console.log("Attaching stream to video element");
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

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
  }, [showExam]);

  // Stop camera stream helper
  const stopCameraStream = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }
    setCameraStream(null);
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
    setCameraConsent(false);
    setRulesAccepted(false);
    setShowCameraCheck(true);
  };

  const handleAnswerQuestion = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestion] = optionIndex;
      return next;
    });
  };

  const handleSubmitExam = () => {
    // stop camera and exit exam
    handleDisableCamera();
    setShowExam(false);

    // Calculate score
    let correctAnswers = 0;
    answers.forEach((answer, idx) => {
      if (answer === examQuestions[idx].correct) {
        correctAnswers++;
      }
    });
    
    const scorePercentage = Math.round((correctAnswers / examQuestions.length) * 100);
    setScore(scorePercentage);
    setShowResults(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Violation: tab switching
  useEffect(() => {
    if (!showExam) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations((prev) => {
          const next = prev + 1;
          if (next >= 2) {
            alert("⚠️ Exam cancelled due to multiple violations!");
            handleSubmitExam();
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExam]);

  // ======= EXAM VIEW =======
  if (showExam && selectedCourse) {
    const q = examQuestions[currentQuestion];

    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-4xl mx-auto">
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
                      Violations: {violations}/2
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
    const isPassed = score >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white p-4">
        <div className="max-w-2xl mx-auto">
          {/* Score Display */}
          <div className="text-center mb-12 pt-8">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 ${
              isPassed ? "bg-green-500/20 border-2 border-green-500" : "bg-red-500/20 border-2 border-red-500"
            }`}>
              <div className="text-center">
                <div className={`text-5xl font-bold ${isPassed ? "text-green-400" : "text-red-400"}`}>
                  {score}%
                </div>
                <div className="text-xs text-gray-400 mt-1">Score</div>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-2">
              {isPassed ? "🎉 Exam Passed!" : "😔 Exam Failed"}
            </h1>
            <p className="text-gray-400 text-lg">
              {isPassed
                ? `Congratulations! You scored ${score}% (${correctCount}/${examQuestions.length} correct)`
                : `You scored ${score}% (${correctCount}/${examQuestions.length} correct). Minimum passing score is 70%.`}
            </p>
          </div>

          {/* Results Breakdown */}
          <Card className="bg-gray-900 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Results Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Correct Answers
                  </span>
                  <span className="font-bold text-green-400">{correctCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Incorrect Answers
                  </span>
                  <span className="font-bold text-red-400">{examQuestions.length - correctCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Time Used
                  </span>
                  <span className="font-bold text-blue-400">{formatTime(300 - timeLeft)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Breakdown */}
          <Card className="bg-gray-900 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Question Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {examQuestions.map((q, idx) => {
                  const isCorrect = answers[idx] === q.correct;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded border-l-4 ${
                        isCorrect
                          ? "bg-green-500/10 border-green-500"
                          : "bg-red-500/10 border-red-500"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white mb-2">Q{idx + 1}: {q.question}</p>
                          <div className="text-sm space-y-1">
                            <p className="text-gray-400">
                              Your answer: <span className={isCorrect ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                                {q.options[answers[idx] ?? -1] || "Not answered"}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-gray-400">
                                Correct answer: <span className="text-green-400 font-semibold">
                                  {q.options[q.correct]}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                setShowResults(false);
                setSelectedCourse(null);
                setCameraConsent(false);
                setRulesAccepted(false);
                setCurrentQuestion(0);
                setAnswers([]);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Take Another Exam
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-green-600 hover:bg-green-700 text-white"
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Take an Exam</h1>
        <p className="text-muted-foreground">Eligible courses for proctored exams</p>
      </div>

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
                {course.nextExamDate ? `Next exam: ${course.nextExamDate}` : "Not available yet"}
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
                    <span>All modules completed</span>
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
          if (!open) {
            // if user closes dialog, stop camera
            handleDisableCamera();
          }
        }}
      >
        <DialogContent>
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
                ref={videoRef}
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
                console.log("Continue clicked, closing camera dialog, opening rules dialog");
                setShowCameraCheck(false);
                setShowExamRules(true);
              }}
            >
              Continue to Exam Rules →
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exam Rules Dialog */}
      <Dialog open={showExamRules} onOpenChange={setShowExamRules}>
        <DialogContent className="max-w-2xl">
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
                <p>✓ Tab switching triggers a warning (2 violations = cancelled)</p>
                <p>✓ Copy/paste attempts are monitored</p>
                <p>✓ Window blur/focus changes are monitored</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Violation Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>⚠️ 1st violation: Warning</p>
                <p>🚫 2nd violation: Exam cancelled for today</p>
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
            disabled={!rulesAccepted}
            onClick={() => {
              console.log("Start Exam clicked");
              setShowExamRules(false);
              setViolations(0);
              setTimeLeft(300);
              setCurrentQuestion(0);
              setAnswers(new Array(examQuestions.length).fill(undefined));
              setShowExam(true);
            }}
          >
            Start Exam
            Start Exam
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};