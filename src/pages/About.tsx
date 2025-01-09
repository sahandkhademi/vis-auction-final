import React from "react";

const About = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4">
      <h1 className="text-4xl mb-6">About VIS Auction</h1>
      
      <div className="bg-white rounded-lg shadow-sm border p-8 space-y-8">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700">
            VIS Auction is a student-developed platform created as a CAS project by Sahand Khademi and Tara Trajic specifically for the VIS community under the school's supervision.
          </p>

          <div className="bg-secondary/50 rounded-lg p-6 my-8">
            <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700">
              Our mission was to create a platform to connect the young artists community at VIS with parents looking to invest in unique art pieces for their homes.
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Join us in shaping the future of digital art collecting.
      </p>
    </div>
  );
};

export default About;
