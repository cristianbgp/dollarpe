import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <QueryClientProvider client={queryClient}>
            <Suspense>{props.children}</Suspense>
          </QueryClientProvider>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
