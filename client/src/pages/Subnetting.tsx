import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import SubnettingExerciseCard from "@/components/SubnettingExerciseCard";

export default function Subnetting() {
  const [subnetType, setSubnetType] = useState("basic");
  const [difficulty, setDifficulty] = useState("easy");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Subnetting Practice</h2>
          <p className="text-slate-600 dark:text-zinc-400">Master IP addressing, subnetting, and VLSM concepts</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={subnetType} onValueChange={setSubnetType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Subnet Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic Subnetting</SelectItem>
              <SelectItem value="vlsm">VLSM Subnetting</SelectItem>
              <SelectItem value="wildcard">Wildcard Masks</SelectItem>
              <SelectItem value="network">Network Calculations</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <SubnettingExerciseCard subnetType={subnetType} difficulty={difficulty} />
      
      <Card>
        <CardHeader>
          <CardTitle>Subnetting Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <div>
              <h4 className="font-medium text-slate-800 mb-3 dark:text-zinc-200">Subnet Mask Reference Table</h4>
              <div className="bg-slate-50 p-3 rounded-md overflow-x-auto dark:bg-zinc-900">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800">
                      <th className="px-3 py-2 text-left text-slate-700 dark:text-zinc-300">CIDR</th>
                      <th className="px-3 py-2 text-left text-slate-700 dark:text-zinc-300">Subnet Mask</th>
                      <th className="px-3 py-2 text-left text-slate-700 dark:text-zinc-300">Hosts Per Subnet</th>
                      <th className="px-3 py-2 text-left text-slate-700 dark:text-zinc-300">Subnet Bits</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/24</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.0</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">254</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">0</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/25</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.128</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">126</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">1</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/26</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.192</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">62</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">2</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/27</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.224</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">30</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">3</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/28</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.240</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">14</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">4</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/29</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.248</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">6</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">5</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/30</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.252</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">2</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">6</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-800 mb-3 dark:text-zinc-200">VLSM Steps</h4>
              <div className="bg-slate-50 p-4 rounded-md text-sm dark:bg-zinc-900">
                <ol className="list-decimal pl-5 space-y-2">
                  <li className="text-slate-700 dark:text-zinc-300">
                    <span className="font-medium text-slate-800 dark:text-zinc-200">Sort requirements by size</span>
                    <p className="mt-1">Arrange networks from largest to smallest based on host requirements.</p>
                  </li>
                  <li className="text-slate-700 dark:text-zinc-300">
                    <span className="font-medium text-slate-800 dark:text-zinc-200">Calculate subnet sizes</span>
                    <p className="mt-1">For each network, find the appropriate subnet mask using the formula 2<sup>n</sup> - 2 ≥ hosts needed, where n is the number of host bits.</p>
                  </li>
                  <li className="text-slate-700 dark:text-zinc-300">
                    <span className="font-medium text-slate-800 dark:text-zinc-200">Allocate address space</span>
                    <p className="mt-1">Start with the largest subnet and assign addresses sequentially.</p>
                  </li>
                  <li className="text-slate-700 dark:text-zinc-300">
                    <span className="font-medium text-slate-800 dark:text-zinc-200">Document assignments</span>
                    <p className="mt-1">Record each network address, subnet mask, range of usable addresses, and broadcast address.</p>
                  </li>
                </ol>
                
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-700">
                  <p className="font-medium text-slate-800 mb-2 dark:text-zinc-200">Example VLSM Calculation</p>
                  <div className="font-mono text-xs text-slate-700 dark:text-zinc-300">
                    <p>Given: 192.168.1.0/24</p>
                    <p>Net A: 100 hosts → /25 → 192.168.1.0/25 (0-127)</p>
                    <p>Net B: 50 hosts → /26 → 192.168.1.128/26 (128-191)</p>
                    <p>Net C: 20 hosts → /27 → 192.168.1.192/27 (192-223)</p>
                    <p>Net D: 5 hosts → /29 → 192.168.1.224/29 (224-231)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
