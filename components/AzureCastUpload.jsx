"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Music,
  Link,
  File,
  XCircle,
  CheckCircle,
  Loader2,
  Youtube,
  Trash2,
  Plus,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:5000/api";

export default function MusicUploader() {
  const [activeTab, setActiveTab] = useState("file");

  // File Upload State
  const [file, setFile] = useState(null);
  const [fileStatus, setFileStatus] = useState({
    type: "idle",
    message: "Ready to upload",
  });

  // Link Upload State
  const [linkInput, setLinkInput] = useState("");
  const [linkQueue, setLinkQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  const fileInputRef = useRef(null);

  // Process link queue
  useEffect(() => {
    const processQueue = async () => {
      if (isProcessingQueue || linkQueue.length === 0) return;

      const pendingItems = linkQueue.filter(
        (item) => item.status === "pending"
      );
      if (pendingItems.length === 0) return;

      setIsProcessingQueue(true);
      const currentItem = pendingItems[0];

      // Update status to processing
      setLinkQueue((prev) =>
        prev.map((item) =>
          item.id === currentItem.id ? { ...item, status: "processing" } : item
        )
      );

      try {
        const isYoutube =
          currentItem.link.includes("youtube.com") ||
          currentItem.link.includes("youtu.be");
        console.log(
          "Uploading link:",
          currentItem.link,
          "isYoutube:",
          isYoutube
        );

        const res = await fetch(`${API_BASE}/upload/link`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            link: currentItem.link,
            is_youtube: isYoutube,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Upload failed");
        }

        const result = await res.json();

        // Update status to success
        setLinkQueue((prev) =>
          prev.map((item) =>
            item.id === currentItem.id
              ? {
                  ...item,
                  status: "success",
                  message: result.message || "Upload successful!",
                }
              : item
          )
        );
      } catch (error) {
        // Update status to error
        setLinkQueue((prev) =>
          prev.map((item) =>
            item.id === currentItem.id
              ? { ...item, status: "error", message: error.message }
              : item
          )
        );
      }

      setIsProcessingQueue(false);
    };

    processQueue();
  }, [linkQueue, isProcessingQueue]);

  // File Upload Handlers
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileStatus({
        type: "idle",
        message: `Selected: ${selectedFile.name}`,
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileStatus({
        type: "idle",
        message: `Selected: ${droppedFile.name}`,
      });
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setFileStatus({ type: "error", message: "Please select a file first" });
      return;
    }

    try {
      setFileStatus({ type: "loading", message: "Uploading..." });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/upload/file`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await res.json();

      setFileStatus({
        type: "success",
        message: result.message || "Upload successful!",
      });

      // Reset form
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setFileStatus({ type: "idle", message: "Ready to upload" });
      }, 5000);
    } catch (error) {
      setFileStatus({
        type: "error",
        message: error.message || "Upload failed",
      });
    }
  };

  // Link Upload Handlers
  const addLinkToQueue = () => {
    if (!linkInput.trim()) return;

    const newLink = {
      id: Date.now(),
      link: linkInput.trim(),
      status: "pending",
      message: "",
    };

    setLinkQueue((prev) => [...prev, newLink]);
    setLinkInput("");
  };

  const removeLinkFromQueue = (id) => {
    setLinkQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompletedLinks = () => {
    setLinkQueue((prev) =>
      prev.filter(
        (item) => item.status === "pending" || item.status === "processing"
      )
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "loading":
      case "processing":
        return <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Music className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Upload Music</h2>
            <p className="text-purple-100 text-sm">
              Add songs from files or links
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-b-2xl shadow-2xl border border-gray-700 border-t-0">
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab("file")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === "file"
                ? "text-purple-400 border-b-2 border-purple-400 bg-gray-900/50"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <File className="h-5 w-5" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab("link")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === "link"
                ? "text-purple-400 border-b-2 border-purple-400 bg-gray-900/50"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Link className="h-5 w-5" />
            Upload Links
          </button>
        </div>

        <div className="p-6">
          {/* File Upload Tab */}
          {activeTab === "file" && (
            <>
              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="mb-6 border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gray-900/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-purple-500/20 rounded-full">
                    <Upload className="h-8 w-8 text-purple-400" />
                  </div>
                  {file ? (
                    <>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-white font-medium">
                        Drop your audio file here or click to browse
                      </p>
                      <p className="text-gray-400 text-sm">
                        Supports all audio formats
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Status Message */}
              <div
                className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
                  fileStatus.type === "error"
                    ? "bg-red-500/10 border border-red-500/30"
                    : fileStatus.type === "success"
                    ? "bg-green-500/10 border border-green-500/30"
                    : fileStatus.type === "loading"
                    ? "bg-purple-500/10 border border-purple-500/30"
                    : "bg-gray-700/50 border border-gray-600"
                }`}
              >
                {getStatusIcon(fileStatus.type)}
                <p
                  className={`text-sm font-medium ${
                    fileStatus.type === "error"
                      ? "text-red-400"
                      : fileStatus.type === "success"
                      ? "text-green-400"
                      : fileStatus.type === "loading"
                      ? "text-purple-400"
                      : "text-gray-300"
                  }`}
                >
                  {fileStatus.message}
                </p>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleFileUpload}
                disabled={fileStatus.type === "loading" || !file}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none group"
              >
                {fileStatus.type === "loading" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>Upload File</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Link Upload Tab */}
          {activeTab === "link" && (
            <>
              {/* Link Input Area */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Youtube className="inline h-4 w-4 mr-1" />
                  Music Link (YouTube, SoundCloud, etc.)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addLinkToQueue()}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={addLinkToQueue}
                    disabled={!linkInput.trim()}
                    className="bg-purple-500 text-white font-medium px-6 py-3 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Links are processed in queue. This may take a few minutes per
                  song.
                </p>
              </div>

              {/* Queue List */}
              {linkQueue.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-300 font-medium">Upload Queue</h3>
                    {linkQueue.some(
                      (item) =>
                        item.status === "success" || item.status === "error"
                    ) && (
                      <button
                        onClick={clearCompletedLinks}
                        className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        Clear completed
                      </button>
                    )}
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {linkQueue.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border ${
                          item.status === "error"
                            ? "bg-red-500/10 border-red-500/30"
                            : item.status === "success"
                            ? "bg-green-500/10 border-green-500/30"
                            : item.status === "processing"
                            ? "bg-purple-500/10 border-purple-500/30"
                            : "bg-gray-700/50 border-gray-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {item.link}
                            </p>
                            {item.message && (
                              <p
                                className={`text-xs mt-1 ${
                                  item.status === "error"
                                    ? "text-red-400"
                                    : item.status === "success"
                                    ? "text-green-400"
                                    : "text-gray-400"
                                }`}
                              >
                                {item.message}
                              </p>
                            )}
                            {item.status === "pending" && (
                              <p className="text-xs text-gray-400 mt-1">
                                Waiting in queue...
                              </p>
                            )}
                            {item.status === "processing" && (
                              <p className="text-xs text-purple-400 mt-1">
                                Processing... This may take a few minutes
                              </p>
                            )}
                          </div>
                          {(item.status === "pending" ||
                            item.status === "error" ||
                            item.status === "success") && (
                            <button
                              onClick={() => removeLinkFromQueue(item.id)}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {linkQueue.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-xl bg-gray-900/50">
                  <Link className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">
                    No links in queue. Add a link to get started.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
