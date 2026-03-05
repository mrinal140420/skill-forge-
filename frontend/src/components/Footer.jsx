import React from 'react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="skillforge-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h5>SkillForge</h5>
          <p>Learn Computer Science the Smart Way</p>
        </div>
        <div className="footer-section">
          <h6>Courses</h6>
          <ul>
            <li><a href="/courses?category=DSA">Data Structures</a></li>
            <li><a href="/courses?category=DBMS">Databases</a></li>
            <li><a href="/courses?category=System Design">System Design</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h6>Resources</h6>
          <ul>
            <li><a href="/api/docs">API Docs</a></li>
            <li><a href="/">Home</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 SkillForge. All rights reserved.</p>
      </div>
    </footer>
  );
};
