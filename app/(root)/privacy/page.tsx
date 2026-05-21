import React from "react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose dark:prose-invert">
        <p>Last updated: May 16, 2026</p>
        <p>
          At Editron, we take your privacy seriously. This policy describes how
          we collect, use, and handle your information when you use our websites,
          software, and services.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information Collection</h2>
        <p>
          We collect and use the following information to provide, improve, and
          protect our Services:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account information:</strong> We collect and associate with your account information like your name, email address, and profile picture.</li>
          <li><strong>Services information:</strong> Our Services are designed to help you store your files, collaborate with others, and work across multiple devices.</li>
          <li><strong>Usage information:</strong> We collect information related to how you use the Services, including actions you take in your account.</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Sharing Information</h2>
        <p>
          We may share information as discussed in this policy, but we won’t sell
          it to advertisers or other third parties.
        </p>
        {/* Add more sections as needed */}
      </div>
    </div>
  );
}
