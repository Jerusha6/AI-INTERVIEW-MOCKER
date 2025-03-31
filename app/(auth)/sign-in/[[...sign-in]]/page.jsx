import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/bg.jpeg')" }}
      />

      {/* Blur Overlay (full screen) */}
      <div className="fixed inset-0 backdrop-blur-sm z-10">
        <div className="flex min-h-screen items-center justify-center p-4">
          <SignIn
            appearance={{
              layout: {
                logoPlacement: "none",
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "blockButton", // Changed from 'iconButton'
              },
              variables: {
                colorPrimary: "#ffffff",
                colorText: "#ffffff",
                colorAlphaShade: "white",
                colorBackground: "transparent",
              },
              elements: {
                rootBox: {
                  width: "100%",
                  maxWidth: "400px",
                },
                card: {
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  boxShadow: "none",
                  width: "100%",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  padding: "2rem",
                  backdropFilter: "blur(8px)",
                },
                header: {
                  textAlign: "center",
                  padding: "0 0 1rem 0",
                },
                headerTitle: {
                  fontSize: "1.75rem",
                  fontWeight: "600",
                  color: "white",
                  marginBottom: "0.25rem",
                },
                headerSubtitle: {
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.95rem",
                  marginBottom: "0",
                },
                dividerLine: {
                  backgroundColor: "rgba(255,255,255,0.15)",
                  margin: "1.5rem 0",
                },
                formField: {
                  marginBottom: "1.25rem",
                },
                formFieldLabel: {
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                },
                formFieldInput: {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  "&:focus": {
                    borderColor: "rgba(255,255,255,0.4)",
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.1)",
                  },
                },
                formFieldInputShowPasswordButton: {
                  color: "rgba(255,255,255,0.6)",
                  "&:hover": {
                    color: "white",
                  },
                },
                formButtonPrimary: {
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "white",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  fontWeight: "500",
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.25)",
                  },
                },
                footer: {
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                },
                footerActionText: {
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.875rem",
                },
                footerActionLink: {
                  color: "white",
                  fontWeight: "500",
                  "&:hover": {
                    color: "rgba(255,255,255,0.8)",
                    textDecoration: "none",
                  },
                },
                identityPreviewEditButton: {
                  color: "white",
                },
                // Social button styling
                socialButtonsBlockButton: {
                  backgroundColor: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                },
                socialButtonsBlockButtonText: {
                  color: "white",
                },
                socialButtonsBlockButtonArrow: {
                  color: "white",
                },
                socialButtonsProviderIcon: {
                  filter: "brightness(1.2)", // Makes the icon brighter
                },
                // Add these to remove any remaining white backgrounds
                formHeaderTitle: {
                  backgroundColor: "transparent",
                },
                formHeaderSubtitle: {
                  backgroundColor: "transparent",
                },
                formResendCodeLink: {
                  backgroundColor: "transparent",
                },
                alternativeMethodsBlockButton: {
                  backgroundColor: "transparent",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
