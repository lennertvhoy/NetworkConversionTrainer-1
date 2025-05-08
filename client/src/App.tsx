import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import BinaryConversion from "@/pages/BinaryConversion";
import Subnetting from "@/pages/Subnetting";
import Home from "@/pages/Home";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/binary" component={BinaryConversion} />
        <Route path="/subnetting" component={Subnetting} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <>
      <Toaster />
      <Router />
    </>
  );
}

export default App;