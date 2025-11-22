import React, { useRef, useState } from 'react';
import { Camera, X, Aperture } from 'lucide-react';

interface Props {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const CameraModal: React.FC<Props> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(err => alert("Camera access denied: " + err));

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      // Use lower quality (0.6) to save storage space
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const data = canvas.toDataURL('image/jpeg', 0.6);
      onCapture(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-full max-w-lg">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold text-lg">Take Live Photo</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="bg-black rounded overflow-hidden aspect-video mb-4 relative">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        </div>
        <div className="flex justify-center">
          <button onClick={takePhoto} className="bg-green-600 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-green-700">
            <Aperture size={20} /> Capture
          </button>
        </div>
      </div>
    </div>
  );
};