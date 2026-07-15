import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from '../lib/constants';

interface UploadProps {
    onComplete?: (base64: string) => void;
}

const Upload = ({ onComplete = () => {} }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const { isSignedIn } = useOutletContext<AuthContext>();

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const processFile = (selected: File) => {
        if (!isSignedIn) return;
        if (!['image/jpeg', 'image/png'].includes(selected.type)) return;

        setFile(selected);

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            let currentProgress = 0;

            intervalRef.current = setInterval(() => {
                currentProgress += PROGRESS_STEP;
                if (currentProgress >= 100) {
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                    setProgress(100);
                    timeoutRef.current = setTimeout(() => {
                        if (mountedRef.current) onComplete(base64);
                    }, REDIRECT_DELAY_MS);
                } else {
                    setProgress(currentProgress);
                }
            }, PROGRESS_INTERVAL_MS);
        };
        reader.onerror = () => {
            setFile(null);
        };
        reader.readAsDataURL(selected);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (isSignedIn) setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isSignedIn) return;
        const dropped = e.dataTransfer.files[0];
        if (dropped) processFile(dropped);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) processFile(selected);
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png"
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ? (
                                "Click to upload or just drag and drop"
                            ) : (
                                "Sign in or sign up with Puter to upload"
                            )}
                        </p>
                        <p className="help">Maximum file size 50MB.</p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check" />
                            ) : (
                                <ImageIcon className="image" />
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }} />

                            <p className="status-text">
                                {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;
