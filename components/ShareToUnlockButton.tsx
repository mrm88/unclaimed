import React, { useState, useEffect } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';

interface ShareToUnlockButtonProps {
  totalValue: number;
  onShare: () => Promise<string | null>;
  onShareComplete: () => void;
}

export default function ShareToUnlockButton({ totalValue, onShare, onShareComplete }: ShareToUnlockButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate share URL when component opens
  useEffect(() => {
    if (isOpen && !shareUrl) {
      generateShareUrl();
    }
  }, [isOpen]);

  const generateShareUrl = async () => {
    setIsGenerating(true);
    try {
      const url = await onShare();
      setShareUrl(url);
    } catch (error) {
      console.error('Failed to generate share URL:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareText = `I just found $${totalValue.toLocaleString()} in unused travel rewards thanks to RewardRadar! You might have hidden miles too → `;
  const fullShareText = shareUrl ? `${shareText}${shareUrl} ✈️💰` : shareText;

  const handleTwitterShare = () => {
    if (!shareUrl) return;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    
    // Track share completion after a delay
    setTimeout(() => {
      onShareComplete();
    }, 3000);
  };

  const handleFacebookShare = () => {
    if (!shareUrl) return;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
    
    setTimeout(() => {
      onShareComplete();
    }, 3000);
  };

  const handleLinkedInShare = () => {
    if (!shareUrl) return;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=550,height=420');
    
    setTimeout(() => {
      onShareComplete();
    }, 3000);
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onShareComplete();
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = fullShareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onShareComplete();
      }, 2000);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white text-gray-700 font-semibold py-4 px-8 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
      >
        <Share2 className="h-5 w-5 mr-2" />
        🎁 Share to Unlock for Free
      </button>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border-2 border-gray-200 p-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Share Your Discovery</h4>
        <p className="text-sm text-gray-600">
          Share on social media to unlock your dashboard for free!
        </p>
      </div>

      {isGenerating ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : shareUrl ? (
        <>
          <div className="space-y-3">
            <button
              onClick={handleTwitterShare}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Twitter className="h-5 w-5 mr-2" />
              Share on Twitter/X
            </button>

            <button
              onClick={handleFacebookShare}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Facebook className="h-5 w-5 mr-2" />
              Share on Facebook
            </button>

            <button
              onClick={handleLinkedInShare}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Linkedin className="h-5 w-5 mr-2" />
              Share on LinkedIn
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 mr-2 text-green-600" />
                  Copied! Unlocking...
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  Copy Share Text
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 italic break-all">
              "{fullShareText}"
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">
              ℹ️ After sharing, you'll automatically unlock your dashboard
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Failed to generate share link. Please try again.</p>
        </div>
      )}

      <button
        onClick={() => setIsOpen(false)}
        className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}