import React from "react";

const About = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4">
      <h1 className="text-4xl mb-6">About VIS Auction</h1>
      
      <div className="bg-white rounded-lg shadow-sm border p-8 space-y-8">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700">
            Welcome to VIS Auction, your premier destination for discovering and collecting exceptional digital artworks through our innovative auction platform.
          </p>

          <div className="bg-secondary/50 rounded-lg p-6 my-8">
            <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700">
              We strive to create a vibrant marketplace where artists and collectors can connect, trade, and celebrate digital creativity in all its forms. Our platform is designed to make art collecting accessible, transparent, and exciting for everyone.
            </p>
          </div>

          <h2 className="text-xl font-semibold mb-4">Why Choose Us</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Curated selection of high-quality digital artworks from emerging and established artists</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Secure and transparent bidding process with real-time updates</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Dedicated support for artists and creators to showcase their work</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Community-driven platform fostering connections between artists and collectors</span>
            </li>
          </ul>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Join us in shaping the future of digital art collecting.
      </p>
    </div>
  );
};

export default About;