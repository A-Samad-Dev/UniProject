"use client";

import { useState } from "react";

export default function NotFound() {
  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "96px",
          paddingLeft: "20px",
          paddingRight: "20px",
          backgroundColor: "var(--background)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Accent */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            opacity: 0.1,
            pointerEvents: "none",
          }}
        >
          <img
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(1) blur(4px)",
            }}
            alt="Academic library background"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAak8J-Knf7PmnRhgDDe0EVmS5J5__-gg-CHWqcaP43eWWF2JaJgXfPg648Ra3vhn9v9ZliN6GOdq226eamcTrNLty4JzRURK2e_VL5pKxXzzR5xm7m1tACgmV4SYzHmRcNec3hICKDivU3HAym9wj_sFwXG2kOF8nXUQCazXNnULC71NLb0b2f3A45GvifA4FrCj4nFK0phNook6g9AS17QQaS8k3jOBQKFT_IAzZTLoTsTftK7-GDIfFU1__RotyggYtCGGGZ24Ad"
          />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "896px",
            textAlign: "center",
          }}
          className="animate-fade-in"
        >
          {/* 404 Heading */}
          <div style={{ marginBottom: "32px" }}>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "40px",
                fontWeight: "700",
                lineHeight: "1.2",
                color: "var(--primary)",
                marginBottom: "16px",
              }}
              className="md:text-[64px] md:leading-[1.1]"
            >
              404
            </h1>
            <div
              style={{
                width: "96px",
                height: "4px",
                backgroundColor: "var(--secondary)",
                margin: "0 auto 32px auto",
              }}
            ></div>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "32px",
                fontWeight: "600",
                lineHeight: "1.3",
                color: "var(--on-surface-variant)",
                maxWidth: "672px",
                margin: "0 auto",
                fontStyle: "italic",
              }}
              className="md:text-[48px] md:leading-[1.2]"
            >
              "Even the most diligent scholars lose their way sometimes."
            </p>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.6",
                color: "var(--outline)",
                marginTop: "16px",
              }}
            >
              The page you are looking for has been moved or archived in our
              great hall.
            </p>
          </div>

          {/* Book Cards Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "32px",
              marginTop: "60px",
              marginBottom: "60px",
            }}
            className="md:grid-cols-3"
          >
            <BookCard
              volume="VOLUME I"
              icon="home"
              title="The Hall"
              subtitle="RETURN HOME"
              href="/"
            />

            <BookCard
              volume="VOLUME II"
              icon="school"
              title="Admissions"
              subtitle="JOIN THE ACADEMY"
              href="#"
              isPrimary={true}
            />

            <BookCard
              volume="VOLUME III"
              icon="diversity_3"
              title="Campus Life"
              subtitle="EXPLORE OUR WORLD"
              href="#"
            />
          </div>

          {/* Search Bar */}
          <SearchBar />

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              justifyContent: "center",
              alignItems: "center",
            }}
            className="md:flex-row"
          >
            <a
              href="/"
              style={{
                padding: "16px 48px",
                backgroundColor: "var(--primary)",
                color: "var(--on-primary)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                lineHeight: "1.0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--primary-container)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary)";
              }}
            >
              Return to the Hall
            </a>
            <button
              style={{
                padding: "16px 48px",
                backgroundColor: "transparent",
                color: "var(--primary)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                lineHeight: "1.0",
                borderRadius: "8px",
                border: "1px solid var(--primary)",
                transition: "all 0.2s ease",
                cursor: "crosshair",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--surface-container)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              onClick={() => console.log("Contact registrar")}
            >
              Contact Registrar
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// Navbar Component
function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 50,
        backgroundColor: "var(--surface)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--outline-variant)",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
        className="md:px-[64px]"
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "32px",
            fontWeight: "600",
            lineHeight: "1.3",
            color: "var(--primary)",
            letterSpacing: "-0.02em",
          }}
        >
          St. Jude's Academy
        </span>

        <div
          style={{ display: "none", alignItems: "center", gap: "32px" }}
          className="md:flex"
        >
          <a
            href="#"
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              color: "var(--on-surface-variant)",
              textDecoration: "none",
            }}
          >
            Academics
          </a>
          <a
            href="#"
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              color: "var(--on-surface-variant)",
              textDecoration: "none",
            }}
          >
            Admissions
          </a>
          <a
            href="#"
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              color: "var(--on-surface-variant)",
              textDecoration: "none",
            }}
          >
            Campus Life
          </a>
          <a
            href="#"
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              color: "var(--on-surface-variant)",
              textDecoration: "none",
            }}
          >
            Faculty
          </a>
          <a
            href="#"
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              color: "var(--on-surface-variant)",
              textDecoration: "none",
            }}
          >
            Alumni
          </a>
          <button
            style={{
              marginLeft: "16px",
              padding: "8px 24px",
              backgroundColor: "var(--primary)",
              color: "var(--on-primary)",
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              borderRadius: "8px",
              border: "none",
              cursor: "crosshair",
            }}
          >
            Apply Now
          </button>
        </div>

        <button
          style={{
            display: "block",
            color: "var(--primary)",
            background: "none",
            border: "none",
            cursor: "crosshair",
          }}
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          style={{
            backgroundColor: "var(--surface)",
            borderTop: "1px solid var(--outline-variant)",
            padding: "16px",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <a
              href="#"
              style={{
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                color: "var(--on-surface-variant)",
                padding: "8px 0",
                textDecoration: "none",
              }}
            >
              Academics
            </a>
            <a
              href="#"
              style={{
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                color: "var(--on-surface-variant)",
                padding: "8px 0",
                textDecoration: "none",
              }}
            >
              Admissions
            </a>
            <a
              href="#"
              style={{
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                color: "var(--on-surface-variant)",
                padding: "8px 0",
                textDecoration: "none",
              }}
            >
              Campus Life
            </a>
            <a
              href="#"
              style={{
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                color: "var(--on-surface-variant)",
                padding: "8px 0",
                textDecoration: "none",
              }}
            >
              Faculty
            </a>
            <a
              href="#"
              style={{
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                color: "var(--on-surface-variant)",
                padding: "8px 0",
                textDecoration: "none",
              }}
            >
              Alumni
            </a>
            <button
              style={{
                padding: "8px 24px",
                backgroundColor: "var(--primary)",
                color: "var(--on-primary)",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                borderRadius: "8px",
                border: "none",
                cursor: "crosshair",
              }}
            >
              Apply Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// BookCard Component
function BookCard({
  volume,
  icon,
  title,
  subtitle,
  href,
  isPrimary = false,
}: any) {
  return (
    <a
      href={href}
      style={{
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "all 0.5s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "2/3",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "all 0.3s ease",
          borderRadius: "8px",
          ...(isPrimary
            ? {
                backgroundColor: "var(--primary)",
                color: "var(--on-primary)",
                border: "1px solid var(--primary)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }
            : {
                backgroundColor: "var(--surface-container-lowest)",
                border: "1px solid var(--outline-variant)",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }),
        }}
        className="book-hover"
      >
        <div
          style={{
            borderBottom: `1px solid ${isPrimary ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}`,
            paddingBottom: "16px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              color: isPrimary ? "var(--secondary-fixed)" : "var(--secondary)",
            }}
          >
            {volume}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 0",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "36px",
              color: isPrimary ? "var(--secondary-fixed)" : "var(--primary)",
            }}
          >
            {icon}
          </span>
        </div>

        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "32px",
              fontWeight: "600",
              lineHeight: "1.3",
              color: isPrimary ? "var(--on-primary)" : "var(--primary)",
            }}
          >
            {title}
          </span>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              marginTop: "8px",
              color: isPrimary
                ? "var(--on-primary-container)"
                : "var(--outline)",
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </a>
  );
}

// SearchBar Component
function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <form
      onSubmit={handleSearch}
      style={{ maxWidth: "448px", margin: "0 auto 48px auto" }}
    >
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search the archives..."
          style={{
            width: "100%",
            background: "transparent",
            borderBottom: "1px solid var(--outline-variant)",
            padding: "16px 8px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "16px",
            lineHeight: "1.6",
            outline: "none",
            textAlign: "center",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderBottomColor = "var(--secondary)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderBottomColor = "var(--outline-variant)")
          }
        />
        <button
          type="submit"
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--primary)",
            background: "none",
            border: "none",
            cursor: "crosshair",
          }}
        >
          <span className="material-symbols-outlined">search</span>
        </button>
      </div>
    </form>
  );
}

// Footer Component
function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "var(--surface-container-highest)",
        borderTop: "1px solid var(--outline-variant)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "32px",
          padding: "120px 20px",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
        className="md:grid-cols-4 md:px-[64px]"
      >
        <div>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "48px",
              fontWeight: "600",
              lineHeight: "1.2",
              color: "var(--primary)",
              display: "block",
              marginBottom: "16px",
            }}
          >
            St. Jude's
          </span>
          <p style={{ color: "var(--on-surface-variant)", maxWidth: "320px" }}>
            Excellence in Education Since 1892. Nurturing the leaders of
            tomorrow with tradition and innovation.
          </p>
        </div>

        <div>
          <h4
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              color: "var(--primary)",
              marginBottom: "24px",
            }}
          >
            RESOURCES
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <li>
              <a
                href="#"
                style={{
                  color: "var(--on-surface-variant)",
                  textDecoration: "underline",
                }}
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="#"
                style={{
                  color: "var(--on-surface-variant)",
                  textDecoration: "underline",
                }}
              >
                Terms of Service
              </a>
            </li>
            <li>
              <a
                href="#"
                style={{
                  color: "var(--on-surface-variant)",
                  textDecoration: "underline",
                }}
              >
                Accreditation
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              color: "var(--primary)",
              marginBottom: "24px",
            }}
          >
            CONNECT
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <li>
              <a
                href="#"
                style={{
                  color: "var(--on-surface-variant)",
                  textDecoration: "underline",
                }}
              >
                Contact Us
              </a>
            </li>
            <li>
              <a
                href="#"
                style={{
                  color: "var(--on-surface-variant)",
                  textDecoration: "underline",
                }}
              >
                Careers
              </a>
            </li>
            <li>
              <a
                href="#"
                style={{
                  color: "var(--on-surface-variant)",
                  textDecoration: "underline",
                }}
              >
                Campus Map
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              color: "var(--primary)",
              marginBottom: "24px",
            }}
          >
            NEWSLETTER
          </h4>
          <div style={{ position: "relative" }}>
            <input
              type="email"
              placeholder="Academic Email"
              style={{
                width: "100%",
                background: "transparent",
                borderBottom: "1px solid var(--outline)",
                padding: "8px 0",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderBottomColor = "var(--secondary)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderBottomColor = "var(--outline)")
              }
            />
            <button
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "crosshair",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "var(--primary)" }}
              >
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "32px 20px",
          borderTop: "1px solid var(--outline-variant)",
          textAlign: "center",
        }}
        className="md:px-[64px]"
      >
        <p style={{ color: "var(--on-surface-variant)" }}>
          © 2024 St. Jude's Academy. Excellence in Education Since 1892.
        </p>
      </div>
    </footer>
  );
}
