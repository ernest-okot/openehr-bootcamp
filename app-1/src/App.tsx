import { QueryClient, QueryClientProvider } from "react-query";
import { AppRouter } from "./router";

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;
