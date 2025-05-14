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
import { useLanguage } from "@/lib/languageContext";

export default function Subnetting() {
  const { t, language } = useLanguage();
  const [subnetType, setSubnetType] = useState("basic");
  const [difficulty, setDifficulty] = useState("easy");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">{t('subnetting.title')}</h2>
          <p className="text-slate-600 dark:text-zinc-400">{t('subnetting.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={subnetType} onValueChange={setSubnetType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('subnetting.type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">{t('subnetting.type.basic')}</SelectItem>
              <SelectItem value="hosts-per-subnet">{t('subnetting.type.hosts-per-subnet')}</SelectItem>
              <SelectItem value="subnets-count">{t('subnetting.type.subnets-count')}</SelectItem>
              <SelectItem value="vlsm">{t('subnetting.type.vlsm')}</SelectItem>
              <SelectItem value="wildcard">{t('subnetting.type.wildcard')}</SelectItem>
              <SelectItem value="ipv6">{t('subnetting.type.ipv6')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t('binary.difficulty')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">{t('binary.difficulty.easy')}</SelectItem>
              <SelectItem value="medium">{t('binary.difficulty.medium')}</SelectItem>
              <SelectItem value="hard">{t('binary.difficulty.hard')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <SubnettingExerciseCard subnetType={subnetType} difficulty={difficulty} />
      
      <Card>
        <CardHeader>
          <CardTitle>{t('subnetting.reference.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <div>
              <h4 className="font-medium text-slate-800 mb-3 dark:text-zinc-200">{t('subnetting.reference.table.title')}</h4>
              <div className="bg-slate-50 p-3 rounded-md overflow-x-auto dark:bg-black">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-zinc-800">
                      <th className="px-3 py-2 text-left text-slate-700 dark:text-zinc-300">{t('subnetting.reference.table.cidr')}</th>
                      <th className="px-3 py-2 text-left text-slate-700 dark:text-zinc-300">{t('subnetting.reference.table.mask')}</th>
                      <th className="px-3 py-2 text-left text-slate-700 dark:text-zinc-300">{t('subnetting.reference.table.hosts')}</th>
                      <th className="px-3 py-2 text-left text-slate-700 dark:text-zinc-300">{t('subnetting.reference.table.bits')}</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/16</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.0.0</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">65,534</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">16</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/17</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.128.0</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">32,766</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">15</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/18</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.192.0</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">16,382</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">14</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/19</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.224.0</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">8,190</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">13</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/20</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.240.0</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">4,094</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">12</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/21</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.248.0</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">2,046</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">11</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/22</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.252.0</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">1,022</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">10</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/23</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.254.0</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">510</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">9</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/24</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.0</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">254</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">8</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/25</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.128</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">126</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">7</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/26</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.192</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">62</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">6</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/27</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.224</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">30</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">5</td>
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
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">3</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">/30</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">255.255.255.252</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">2</td>
                      <td className="px-3 py-2 border-t border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">2</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h4 className="font-medium text-slate-800 mt-6 mb-3 dark:text-zinc-200">{t('subnetting.reference.formula.title')}</h4>
              <div className="bg-slate-50 p-4 rounded-md text-sm dark:bg-black">
                <div className="space-y-2 text-slate-700 dark:text-zinc-300">
                  <p className="font-medium">{t('subnetting.reference.formula.hosts')}</p>
                  <p className="font-mono">{t('subnetting.reference.formula.usable')} = 2<sup>n</sup> - 2</p>
                  <p className="text-xs">{t('subnetting.reference.formula.hosts.desc')}</p>
                  
                  <div className="pt-2 mt-2 border-t border-slate-200 dark:border-zinc-700">
                    <p className="font-medium">{t('subnetting.reference.formula.subnets')}</p>
                    <p className="font-mono">{t('subnetting.reference.formula.number')} = 2<sup>m</sup></p>
                    <p className="text-xs">{t('subnetting.reference.formula.subnets.desc')}</p>
                  </div>
                  
                  <div className="pt-2 mt-2 border-t border-slate-200 dark:border-zinc-700">
                    <p className="font-medium">{t('subnetting.reference.formula.subnet.formula')}</p>
                    <p className="font-mono">256 - {t('subnetting.reference.formula.mask_octet')} = {t('subnetting.reference.formula.increment')}</p>
                    <p className="text-xs">{t('subnetting.reference.formula.subnet.desc')}</p>
                    <p className="text-xs mt-1">{t('subnetting.reference.formula.example')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-800 mb-3 dark:text-zinc-200">{t('subnetting.reference.vlsm.title')}</h4>
              <div className="bg-slate-50 p-4 rounded-md text-sm dark:bg-zinc-900">
                <ol className="list-decimal pl-5 space-y-2">
                  <li className="text-slate-700 dark:text-zinc-300">
                    <span className="font-medium text-slate-800 dark:text-zinc-200">{t('subnetting.reference.vlsm.step1.title')}</span>
                    <p className="mt-1">{t('subnetting.reference.vlsm.step1.desc')}</p>
                  </li>
                  <li className="text-slate-700 dark:text-zinc-300">
                    <span className="font-medium text-slate-800 dark:text-zinc-200">{t('subnetting.reference.vlsm.step2.title')}</span>
                    <p className="mt-1">{t('subnetting.reference.vlsm.step2.desc')}</p>
                  </li>
                  <li className="text-slate-700 dark:text-zinc-300">
                    <span className="font-medium text-slate-800 dark:text-zinc-200">{t('subnetting.reference.vlsm.step3.title')}</span>
                    <p className="mt-1">{t('subnetting.reference.vlsm.step3.desc')}</p>
                  </li>
                  <li className="text-slate-700 dark:text-zinc-300">
                    <span className="font-medium text-slate-800 dark:text-zinc-200">{t('subnetting.reference.vlsm.step4.title')}</span>
                    <p className="mt-1">{t('subnetting.reference.vlsm.step4.desc')}</p>
                  </li>
                </ol>
                
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-700">
                  <p className="font-medium text-slate-800 mb-2 dark:text-zinc-200">{t('subnetting.reference.vlsm.example.title')}</p>
                  <div className="font-mono text-xs text-slate-700 dark:text-zinc-300">
                    <p>Given: 192.168.1.0/24</p>
                    <p>Net A: 100 hosts → /25 → 192.168.1.0/25 (0-127)</p>
                    <p>Net B: 50 hosts → /26 → 192.168.1.128/26 (128-191)</p>
                    <p>Net C: 20 hosts → /27 → 192.168.1.192/27 (192-223)</p>
                    <p>Net D: 5 hosts → /29 → 192.168.1.224/29 (224-231)</p>
                  </div>
                </div>
              </div>
              
              <h4 className="font-medium text-slate-800 mt-6 mb-3 dark:text-zinc-200">{t('subnetting.reference.process.title')}</h4>
              <div className="bg-slate-50 p-4 rounded-md text-sm dark:bg-black">
                <div className="space-y-3 text-slate-700 dark:text-zinc-300">
                  <p className="font-medium">{t('subnetting.reference.process.comprehensive.title')}</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>{t('subnetting.reference.process.comprehensive.step1')}</li>
                    <li>{t('subnetting.reference.process.comprehensive.step2')}</li>
                    <li>{t('subnetting.reference.process.comprehensive.step3')}</li>
                    <li>{t('subnetting.reference.process.comprehensive.step4')}</li>
                    <li>{t('subnetting.reference.process.comprehensive.step5')}</li>
                  </ol>

                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-zinc-700">
                    <p className="font-medium">{t('subnetting.reference.wildcards.title')}</p>
                    <p className="mt-1">{t('subnetting.reference.wildcards.desc')}</p>
                    <div className="mt-2 font-mono text-xs">
                      <p>Subnet Mask: 255.255.255.0 (/24)</p>
                      <p>Wildcard Mask: 0.0.0.255</p>
                      <p>Access Control List Example:</p>
                      <p>permit ip 192.168.1.0 0.0.0.255 any</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-zinc-700">
                    <p className="font-medium">{t('subnetting.reference.ipv6.title')}</p>
                    <p className="mt-1">{t('subnetting.reference.ipv6.desc')}</p>
                    <div className="mt-2 font-mono text-xs">
                      <p>Full: 2001:0db8:0000:0000:0000:0000:0000:0001</p>
                      <p>Compressed: 2001:db8::1</p>
                    </div>
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
