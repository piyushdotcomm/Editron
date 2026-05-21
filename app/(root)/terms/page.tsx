import React from "react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose dark:prose-invert">
        <p>Last updated: May 16, 2026</p>
        <p>
          Welcome to Editron. By using our service, you agree to these terms.
          Please read them carefully.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Use of Service</h2>
        <p>
          You must follow any policies made available to you within the Service.
          Don’t misuse our Services. For example, don’t interfere with our Services
          or try to access them using a method other than the interface and the
          instructions that we provide.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Your Editron Account</h2>
        <p>
          You may need an Editron Account in order to use some of our Services.
          You may create your own Editron Account, or your Editron Account may be
          assigned to you by an administrator, such as your employer or educational
          institution.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Privacy and Copyright Protection</h2>
        <p>
          Editron’s privacy policies explain how we treat your personal data and
          protect your privacy when you use our Services. By using our Services,
          you agree that Editron can use such data in accordance with our privacy
          policies.
        </p>
        {/* Add more sections as needed */}
      </div>
    </div>
  );
}
