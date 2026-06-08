import { ErrorBoundary } from "react-error-boundary";

import App from "./App";
import { AuthGate } from "./components/auth-gate.component";
import { ErrorFallback } from "./ErrorFallback";
import { AuthProvider } from "./hooks/use-auth";
import { useAppTheme } from "./hooks/use-theme";
import { ThemeContext } from "./hooks/theme.context";
import type { IAuthService } from "./services/rayfin-auth.service";

interface RootProps {
  rayfinAuthService: IAuthService;
}

export function Root({ rayfinAuthService }: RootProps) {
  const { isDark, toggleTheme } = useAppTheme();

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthProvider rayfinAuthService={rayfinAuthService}>
          <AuthGate>
            <App />
          </AuthGate>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeContext.Provider>
  );
}
