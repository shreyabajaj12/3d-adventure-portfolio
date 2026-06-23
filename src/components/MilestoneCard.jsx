import React, { useState } from 'react';

export default function MilestoneCard({ station }) {
  if (!station) return null;

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState(false);

  const handleInputChange = (field, e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all required fields!");
      return;
    }

    setIsSending(true);
    setSendSuccess(false);
    setSendError(false);

    try {
      const response = await fetch('https://portfolio-backend-vdv0.onrender.com/api/ptrf/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: formData.email,
          name: formData.name,
          body: formData.message
        })
      });

      if (response.ok) {
        setSendSuccess(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSendError(true);
      }
    } catch (err) {
      console.error(err);
      setSendError(true);
    } finally {
      setIsSending(false);
    }
  };

  const milestoneData = {
    // ── Section 1: About ──────────────────────────────────
    bihar: {
      tag: "Introduction",
      title: "Shreya Bajaj",
      subtitle: "Software Developer · AI/ML Engineer · Full-Stack",
      description: "I build intelligent, scalable systems — from backend APIs and ML models to clean, responsive frontends. Currently contributing as a Software Developer Intern at Nielsen, Bengaluru.",
      details: [
        { icon: "⚡", label: "Languages", value: "Java, Python, JavaScript, SQL, HTML5, CSS3" },
        { icon: "⚙️", label: "Frameworks & Libraries", value: "Spring Boot, React, Node.js, Streamlit, Scikit-learn, Tensorflow" },
        { icon: "🛠️", label: "Databases & Tools", value: "MySQL, Git, GitHub, REST APIs, OAuth2, Docker" },
        { icon: "🎯", label: "Focus Areas", value: "Backend Systems, AI/ML Integration, Full-Stack Development" },
      ]
    },

    // ── Section 2: Projects & Education ──────────────────
    punjab: {
      tag: "Education & Projects",
      title: "Projects & Education",
      subtitle: "B.Tech CSE (AI & ML) · Lovely Professional University",
      description: "Specializing in Artificial Intelligence and Machine Learning at LPU, Punjab. Here are select projects that reflect my engineering depth:",
      isProjects: true,
      education: {
        school: "Lovely Professional University (LPU), Punjab",
        degree: "B.Tech — Computer Science & Engineering",
        spec: "Specialization: Artificial Intelligence & Machine Learning"
      },
      projectList: [
        {
          title: "Resume Job Predictor",
          tech: "Python · Scikit-learn · Pandas · Streamlit · Seaborn",
          desc: "ML-based resume analysis that extracts skills and experience to predict the top 5 most suitable job roles for a candidate."
        },
        {
          title: "Smart Contact Manager",
          tech: "Java · Spring Boot · MySQL · OAuth2 · Cloudinary",
          desc: "Secure cloud contact portal with profile picture uploads via Cloudinary, full CRUD support, and OAuth2 authentication."
        },
        {
          title: "Email Sender Application",
          tech: "Java · Spring Boot · React · MySQL · SMTP",
          desc: "Full-stack application for sending customized HTML-formatted emails with file and attachment support."
        }
      ]
    },

    // ── Section 3: Experience ────────────────────────────
    experience: {
      tag: "Experience",
      title: "Nielsen Internship",
      subtitle: "Software Developer Intern · Bengaluru, Karnataka",
      description: "Gaining hands-on enterprise experience at Nielsen — one of the world's leading data analytics companies — building scalable software features in a production environment.",
      details: [
        { icon: "💼", label: "Role", value: "Software Developer Intern @ Nielsen" },
        { icon: "📍", label: "Location", value: "Bengaluru, Karnataka (Silicon Valley of India)" },
        { icon: "🗓️", label: "Duration", value: "Ongoing Internship" },
        { icon: "🤝", label: "Availability", value: "Open to full-time Software Engineer roles" },
      ]
    },

    // ── Section 4: Contact ───────────────────────────────
    contact: {
      tag: "Get In Touch",
      title: "Let's Connect",
      subtitle: "Reach out via profiles or drop me a message",
      description: "Whether it's about a role, a collaboration, or just a hello — I'd love to hear from you!",
      isContact: true,
      profiles: [
        { name: "GitHub", username: "shreyabajaj12", url: "https://github.com/shreyabajaj12", class: "github", icon: "🐙" },
        { name: "LeetCode", username: "shresaw", url: "https://leetcode.com/u/shresaw/", class: "leetcode", icon: "🏆" },
        { name: "Codeforces", username: "ShreyaBajaj", url: "https://codeforces.com/profile/ShreyaBajaj", class: "codeforces", icon: "📊" },
        { name: "LinkedIn", username: "shreya-bajaj", url: "https://www.linkedin.com/in/shreya-bajaj-541998279/", class: "linkedin", icon: "👔" },
        { name: "Resume / CV", username: "View PDF", url: "https://drive.google.com/file/d/15loLVb7wg3ZEL_Vvs_0P3yh4MvNKn3c0/view?usp=sharing", class: "github", icon: "📄" },
      ]
    }
  };

  const data = milestoneData[station];
  if (!data) return null;

  return (
    <div className="milestone-card interactive">
      <div className="card-header">
        <span className="card-tag">{data.tag}</span>
        <h2 className="card-title">{data.title}</h2>
        <p className="card-subtitle">{data.subtitle}</p>
      </div>

      <div className="card-body">
        <p className="card-description">{data.description}</p>

        {/* ── Projects & Education ── */}
        {data.isProjects && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="nielsen-internship-details">
              <div className="nielsen-role">🎓 Education</div>
              <p className="nielsen-desc" style={{ fontWeight: 600, color: 'var(--color-dark)' }}>{data.education.school}</p>
              <p className="nielsen-desc">{data.education.degree}</p>
              <p className="nielsen-desc">{data.education.spec}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="section-label">Featured Projects</span>
              {data.projectList.map((project, idx) => (
                <div key={idx} className="project-item">
                  <div className="project-title">{project.title}</div>
                  <div className="project-tech">{project.tech}</div>
                  <p className="project-desc">{project.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Standard details (About + Experience) ── */}
        {!data.isProjects && !data.isContact && data.details && (
          <div className="details-list">
            {data.details.map((item, idx) => (
              <div className="details-item" key={idx}>
                <span className="details-icon" role="img" aria-label={item.label}>
                  {item.icon}
                </span>
                <div className="details-content">
                  <span className="details-label">{item.label}</span>
                  <span className="details-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Contact: profiles + form ── */}
        {data.isContact && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div>
              <span className="section-label">Profiles &amp; Links</span>
              <div className="profiles-grid" style={{ marginTop: '8px' }}>
                {data.profiles.map((profile, idx) => (
                  <a
                    key={idx}
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`profile-boarding-pass ${profile.class}`}
                  >
                    <span className="profile-logo" role="img" aria-label={profile.name}>
                      {profile.icon}
                    </span>
                    <div className="profile-info">
                      <span className="profile-name">{profile.name}</span>
                      <span className="profile-username">@{profile.username}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="contact-form-wrapper">
              <p className="contact-form-title">✉️ Send a Message</p>
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e)}
                  required
                  className="contact-input"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e)}
                  required
                  className="contact-input"
                />
                <textarea
                  placeholder="Your message..."
                  rows="3"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e)}
                  required
                  className="contact-input contact-textarea"
                />
                <button type="submit" disabled={isSending} className="contact-submit">
                  {isSending ? "Sending..." : "Send Message →"}
                </button>
              </form>

              {sendSuccess && <div className="toast-success">✓ Message sent! I'll get back to you soon.</div>}
              {sendError && <div className="toast-error">✕ Failed to send. Try reaching me on LinkedIn.</div>}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
