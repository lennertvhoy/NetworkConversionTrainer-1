import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
          Welcome to BinaryNetTrainer
        </h1>
        <p className="text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Practice binary conversions and subnetting with interactive exercises to help you master networking concepts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Binary Conversion Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-zinc-400 mb-6">
              Practice converting between binary, decimal, and hexadecimal number systems. 
              Perfect for building foundational skills for networking and computer science.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                Binary to Decimal
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                Binary to Hex
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                Hex to Binary
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                Decimal to Binary
              </span>
            </div>
            <Link href="/binary">
              <Button className="w-full bg-primary hover:bg-blue-600">
                Start Binary Practice
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Subnetting Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-zinc-400 mb-6">
              Practice IP addressing, subnet mask calculations, VLSM, and network calculations.
              Great for CCNA exam preparation and networking skills.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                Basic Subnetting
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                VLSM
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                Wildcard Masks
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                Network Calculations
              </span>
            </div>
            <Link href="/subnetting">
              <Button className="w-full bg-primary hover:bg-blue-600">
                Start Subnetting Practice
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About This Application</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-zinc-400 mb-4">
            This application helps you practice binary conversions and subnetting concepts that are essential for 
            networking professionals and students preparing for certifications like CCNA.
          </p>
          <p className="text-slate-600 dark:text-zinc-400 mb-4">
            The practice exercises include:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-zinc-400 mb-4">
            <li>Binary to decimal, hexadecimal, and reverse conversions</li>
            <li>Basic subnetting (network address, broadcast address, host range)</li>
            <li>VLSM (Variable Length Subnet Masking) for efficient network design</li>
            <li>Wildcard mask calculations for access control lists</li>
            <li>Network calculations with realistic scenarios</li>
          </ul>
          <p className="text-slate-600 dark:text-zinc-400">
            Choose your practice area and difficulty level to get started. Each exercise provides 
            detailed explanations to help you understand the concepts better.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}