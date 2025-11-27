

import React from 'react';

const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-12">
        <h2 className="text-2xl font-bold text-[#FF4D00]">{title}</h2>
        <div className="mt-4 text-gray-300 space-y-4 prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white">
            {children}
        </div>
    </div>
);

const LegalPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-black tracking-tighter text-white text-center">Legal Information</h1>
      
      <LegalSection title="Terms of Service">
        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
        <p>Welcome to NextArc Studio ("the Platform"). These terms and conditions outline the rules and regulations for the use of our website and services. By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use NextArc Studio if you do not accept all of the terms and conditions stated on this page.</p>

        <h4>1. Definitions</h4>
        <ul>
            <li><strong>"Platform"</strong> refers to the NextArc Studio website and its services.</li>
            <li><strong>"User," "You," "Your"</strong> refers to you, the person accessing this website, registered as either an "Athlete" or a "Creator".</li>
            <li><strong>"Athlete"</strong> refers to a User who posts projects seeking creative services.</li>
            <li><strong>"Creator"</strong> refers to a User who offers and provides creative services to Athletes.</li>
            <li><strong>"Project"</strong> refers to the specific work request posted by an Athlete.</li>
        </ul>

        <h4>2. User Accounts</h4>
        <p>To access most features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process. You are responsible for safeguarding your password and for any activities or actions under your account.</p>
        <p>Creators undergo a verification process. We reserve the right to approve or deny any Creator account application at our sole discretion. Unverified creators may have limited access to Platform features.</p>
        
        <h4>3. The Platform's Role</h4>
        <p>NextArc Studio is a neutral marketplace that connects Athletes and Creators. We are not a party to the contracts for services agreed upon between Athletes and Creators. We do not hire or employ Creators, nor are we an agent for any User.</p>

        <h4>4. Payments and Fees</h4>
        <p>When an Athlete accepts a Creator's offer, the Athlete will be charged the full amount of the offer plus a non-refundable platform fee of 8% (the "Platform Fee").</p>
        <p>Payments are processed through our secure payment gateway. The funds are held in a holding account until the Athlete marks the project as "Completed". Upon completion, the funds (minus the Platform Fee) are released to the Creator.</p>
        <p>NextArc Studio is not responsible for any disputes over payments between Users, but we may provide mediation assistance at our discretion.</p>
        
        <h4>5. Intellectual Property & Joint Ownership</h4>
        <p>The content, features, and functionality of the Platform itself are and will remain the exclusive property of NextArc Studio and its licensors.</p>
        <p><strong>Joint Ownership Model:</strong> Upon full payment to the Creator, the ownership of the final delivered work is transferred to a <strong>Joint Ownership</strong> structure:</p>
        <ul>
            <li><strong>The Athlete:</strong> Grants full commercial and personal rights to distribute, modify, and publish the content.</li>
            <li><strong>NextArc Media:</strong> Retains a perpetual, non-exclusive, royalty-free license to use the content for promotional purposes, inclusion in the NextArc Showcase, and distribution on NextArc-owned social media channels.</li>
            <li><strong>The Creator:</strong> Retains a perpetual, non-exclusive "Portfolio License" to display the work in personal portfolios and showreels for the purpose of self-promotion.</li>
        </ul>
        <p>By using the platform, you explicitly agree that NextArc Media has the right to re-publish successful projects to promote the community and the creators involved.</p>

        <h4>6. Limitation of Liability</h4>
        <p>In no event shall NextArc Studio, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

        <h4>7. Governing Law</h4>
        <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which NextArc Studio is registered, without regard to its conflict of law provisions.</p>
      </LegalSection>
      
      <LegalSection title="Privacy Policy">
        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
        <p>Your privacy is important to us. It is NextArc Studio's policy to respect your privacy regarding any information we may collect from you across our website.</p>

        <h4>1. Information We Collect</h4>
        <ul>
            <li><strong>Account Information:</strong> When you register, we collect your name, email, password, and chosen role (Athlete or Creator).</li>
            <li><strong>Profile Information:</strong> Creators may provide additional information such as a bio, profile picture, and portfolio links.</li>
            <li><strong>Project Information:</strong> We collect details you provide about your projects, including descriptions, budgets, deadlines, and uploaded media.</li>
            <li><strong>Transaction Information:</strong> We collect information about payments but do not store sensitive payment card details. This is handled by our third-party payment processor.</li>
            <li><strong>Communications:</strong> We store communications made through the platform's messaging features.</li>
        </ul>

        <h4>2. How We Use Your Information</h4>
        <ul>
            <li>To provide, operate, and maintain our Platform.</li>
            <li>To improve, personalize, and expand our Platform.</li>
            <li>To understand and analyze how you use our Platform.</li>
            <li>To process your transactions and prevent fraud.</li>
            <li>To communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.</li>
        </ul>

        <h4>3. Data Security</h4>
        <p>We use a variety of security measures to maintain the safety of your personal information. All data is stored in a secure, password-protected database. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.</p>
        
        <h4>4. Cookies</h4>
        <p>We use cookies to help us remember and process your session information. You can choose to disable cookies through your browser options, but this may affect your ability to use some features of our Platform.</p>
        
        <h4>5. Your Rights</h4>
        <p>You have the right to access, update, or delete the information we have on you. Whenever made possible, you can access, update, or request deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.</p>
      </LegalSection>
    </div>
  );
};

export default LegalPage;