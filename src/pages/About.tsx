import React from "react";

const About = () => {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center mb-8">About Digital Bid Bazaar</h1>
      <div className="max-w-3xl mx-auto prose prose-lg">
        <p className="mb-6">
          Welcome to Digital Bid Bazaar, your premier destination for discovering and collecting exceptional digital artworks through our innovative auction platform.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="mb-6">
          We strive to create a vibrant marketplace where artists and collectors can connect, trade, and celebrate digital creativity in all its forms.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Curated selection of high-quality digital artworks</li>
          <li>Secure and transparent bidding process</li>
          <li>Support for artists and creators</li>
          <li>Community-driven platform</li>
        </ul>
      </div>
    </div>
  );
};

export default About;