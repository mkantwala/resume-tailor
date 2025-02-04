"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Wand2, Clipboard, Download, FileText, Link } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

// Add type definitions
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export default function TailoredResumePage() {
  // Add active tab states
  const [activeResumeTab, setActiveResumeTab] = useState("resume-upload");
  const [activeJobTab, setActiveJobTab] = useState("jd-upload");

  // Resume states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeText, setResumeText] = useState("");

  // Job states
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");

  // Result
  const [tailoredResume, setTailoredResume] = useState("");

  // Loading animation
  const [isTailoring, setIsTailoring] = useState(false);

  // Get active data based on selected tabs
  const getActiveData = () => {
    const resumeData = {
      type: activeResumeTab,
      data: activeResumeTab === "resume-upload" 
        ? resumeFile 
        : activeResumeTab === "resume-url"
        ? resumeUrl
        : resumeText
    };

    const jobData = {
      type: activeJobTab,
      data: activeJobTab === "jd-upload"
        ? jobFile
        : activeJobTab === "jd-url"
        ? jobUrl
        : jobText
    };

    return { resumeData, jobData };
  };

  // Add new upload function
  const uploadToBackend = async (resumeData: any, jobData: any) => {
    const formData = new FormData();
    
    // Handle Resume Data
    if (resumeData.type === "resume-upload" && resumeData.data) {
      formData.append("resume_file", resumeData.data);
    } else if (resumeData.type === "resume-url") {
      formData.append("resume_url", String(resumeData.data || ""));
    } else {
      formData.append("resume_text", String(resumeData.data || ""));
    }
  
    // Handle Job Data
    if (jobData.type === "jd-upload" && jobData.data) {
      formData.append("job_file", jobData.data);
    } else if (jobData.type === "jd-url") {
      formData.append("job_url", String(jobData.data || ""));
    } else {
      formData.append("job_text", String(jobData.data || ""));
    }
  
    try {
      const response = await fetch("https://textify-ls6r.onrender.com/process", {
      // const response = await fetch("http://127.0.0.1:5000/process", {
        method: "POST",
        body: formData,
      });
  
      
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  // Update handleSubmit
  const handleSubmit = async () => {
    // Reset the previous tailored resume output
    setTailoredResume("");
    setIsTailoring(true);
    try {
      const { resumeData, jobData } = getActiveData();
      // console.log('Sending to backend:', { resume: resumeData, job: jobData });
      
      const result = await uploadToBackend(resumeData, jobData);
      setTailoredResume(result.tailored_resume || "Failed to get tailored resume");
    } catch (error) {
      console.error("Failed to tailor resume:", error);
      setTailoredResume("Error: Failed to process resume");
    } finally {
      setIsTailoring(false);
    }
  };

  // Download
  const handleDownload = () => {
    const blob = new Blob([tailoredResume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Tailored_Resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Paste from Clipboard (Resume)
  const handleResumePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setResumeText((prev) => prev + text);
    } catch (error) {
      console.error("Failed to read from clipboard", error);
    }
  };

  // Paste from Clipboard (Job)
  const handleJobPasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJobText((prev) => prev + text);
    } catch (error) {
      console.error("Failed to read from clipboard", error);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl font-extrabold text-blue-800 bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            AI-Powered Resume Tailoring
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg">
            Upload or paste your resume and job description to create a tailored
            version that maximizes your chances of landing your dream job.
          </p>
        </section>

        {/* Side-by-Side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Input */}
          <Card className="hover:shadow-lg transition-shadow duration-300 animate-slide-in-left">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Resume Input
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <Tabs 
                defaultValue="resume-upload" 
                onValueChange={(value) => setActiveResumeTab(value)}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="resume-upload">Upload</TabsTrigger>
                  <TabsTrigger value="resume-url">URL</TabsTrigger>
                  <TabsTrigger value="resume-paste">Paste</TabsTrigger>
                </TabsList>

                {/* Upload Resume */}
                <TabsContent value="resume-upload">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="flex gap-2 items-center"
                      asChild
                    >
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Upload Resume
                        <input
                          type="file"
                          className="absolute w-0 h-0 opacity-0"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setResumeFile(e.target.files[0]);
                              setResumeText("");
                              setResumeUrl("");
                            }
                          }}
                        />
                      </label>
                    </Button>
                    {resumeFile && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600">{resumeFile.name}</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setResumeFile(null)}
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Resume URL */}
                <TabsContent value="resume-url">
                  <label className="mb-1 text-sm font-semibold text-gray-900 block">
                    Enter Resume URL
                  </label>
                  <Input
                    type="text"
                    placeholder="http://example.com/resume"
                    className="text-black"
                    value={resumeUrl}
                    onChange={(e) => {
                      setResumeUrl(e.target.value);
                      setResumeFile(null);
                      setResumeText("");
                    }}
                  />
                </TabsContent>

                {/* Paste Resume */}
                <TabsContent value="resume-paste">
                  <label className="mb-1 text-sm font-semibold text-gray-900 block">
                    Paste Your Resume
                  </label>
                  <Textarea
                    placeholder="Paste your resume text here..."
                    className="text-black mt-1"
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      setResumeFile(null);
                      setResumeUrl("");
                    }}
                  />
                  <div className="flex items-center justify-end mt-2">
                    <Button
                      variant="outline"
                      className="flex gap-2 items-center"
                      onClick={handleResumePasteFromClipboard}
                    >
                      <Clipboard className="h-4 w-4" />
                      Paste from Clipboard
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Job Description Input */}
          <Card className="hover:shadow-lg transition-shadow duration-300 animate-slide-in-right">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Link className="h-6 w-6 text-blue-600" />
                Job Description Input
              </CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <Tabs 
                defaultValue="jd-upload"
                onValueChange={(value) => setActiveJobTab(value)}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="jd-upload">Upload</TabsTrigger>
                  <TabsTrigger value="jd-url">URL</TabsTrigger>
                  <TabsTrigger value="jd-paste">Paste</TabsTrigger>
                </TabsList>

                {/* Upload JD */}
                <TabsContent value="jd-upload">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="flex gap-2 items-center"
                      asChild
                    >
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Upload Job Description
                        <input
                          type="file"
                          className="absolute w-0 h-0 opacity-0"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setJobFile(e.target.files[0]);
                              setJobText("");
                              setJobUrl("");
                            }
                          }}
                        />
                      </label>
                    </Button>
                    {jobFile && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600">{jobFile.name}</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setJobFile(null)}
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* JD URL */}
                <TabsContent value="jd-url">
                  <label className="mb-1 text-sm font-semibold text-gray-900 block">
                    Enter Job URL
                  </label>
                  <Input
                    type="text"
                    placeholder="http://example.com/job-post"
                    className="text-black"
                    value={jobUrl}
                    onChange={(e) => {
                      setJobUrl(e.target.value);
                      setJobFile(null);
                      setJobText("");
                    }}
                  />
                </TabsContent>

                {/* Paste JD */}
                <TabsContent value="jd-paste">
                  <label className="mb-1 text-sm font-semibold text-gray-900 block">
                    Paste Job Description
                  </label>
                  <Textarea
                    placeholder="Paste job description text here..."
                    className="text-black mt-1"
                    value={jobText}
                    onChange={(e) => {
                      setJobText(e.target.value);
                      setJobFile(null);
                      setJobUrl("");
                    }}
                  />
                  <div className="flex items-center justify-end mt-2">
                    <Button
                      variant="outline"
                      className="flex gap-2 items-center"
                      onClick={handleJobPasteFromClipboard}
                    >
                      <Clipboard className="h-4 w-4" />
                      Paste from Clipboard
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Tailor & Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleSubmit}
              className="flex gap-2 items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Wand2 className="h-4 w-4" />
              Tailor Resume
            </Button>
            {isTailoring && (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-blue-600 rounded-full animate-ping" />
                <p className="text-gray-700 font-semibold">
                  Tailoring your resume...
                </p>
              </div>
            )}
          </div>

          {tailoredResume && (
            <Card className="mt-8">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Tailored Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tailoredResume}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}