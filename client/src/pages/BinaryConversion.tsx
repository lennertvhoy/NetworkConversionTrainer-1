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
import BinaryExerciseCard from "@/components/BinaryExerciseCard";
import { useLanguage } from "@/lib/languageContext";

export default function BinaryConversion() {
  const { t } = useLanguage();
  const [conversionType, setConversionType] = useState("bin2dec");
  const [difficulty, setDifficulty] = useState("easy");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">{t('binary.title')}</h2>
          <p className="text-slate-600 dark:text-zinc-400">{t('binary.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={conversionType} onValueChange={setConversionType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Conversion Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bin2dec">{t('binary.type.bin2dec')}</SelectItem>
              <SelectItem value="bin2hex">{t('binary.type.bin2hex')}</SelectItem>
              <SelectItem value="hex2bin">{t('binary.type.hex2bin')}</SelectItem>
              <SelectItem value="dec2bin">{t('binary.type.dec2bin')}</SelectItem>
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
      
      <BinaryExerciseCard conversionType={conversionType} difficulty={difficulty} />
      
      <Card>
        <CardHeader>
          <CardTitle>{t('binary.tips.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <div>
              <h4 className="font-medium text-slate-800 mb-2 dark:text-zinc-200">{t('binary.tips.bin2dec.title')}</h4>
              <p className="text-sm text-slate-600 mb-2 dark:text-zinc-400">{t('binary.tips.bin2dec.description')}</p>
              <div className="bg-slate-50 p-3 rounded-md font-mono text-sm dark:bg-zinc-900">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-center text-slate-700 dark:text-zinc-300">{t('binary.tips.position')}</th>
                        <th className="text-center text-slate-700 dark:text-zinc-300">2<sup>7</sup></th>
                        <th className="text-center text-slate-700 dark:text-zinc-300">2<sup>6</sup></th>
                        <th className="text-center text-slate-700 dark:text-zinc-300">2<sup>5</sup></th>
                        <th className="text-center text-slate-700 dark:text-zinc-300">2<sup>4</sup></th>
                        <th className="text-center text-slate-700 dark:text-zinc-300">2<sup>3</sup></th>
                        <th className="text-center text-slate-700 dark:text-zinc-300">2<sup>2</sup></th>
                        <th className="text-center text-slate-700 dark:text-zinc-300">2<sup>1</sup></th>
                        <th className="text-center text-slate-700 dark:text-zinc-300">2<sup>0</sup></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-center text-slate-700 dark:text-zinc-300">{t('binary.tips.value')}</td>
                        <td className="text-center text-slate-700 dark:text-zinc-300">128</td>
                        <td className="text-center text-slate-700 dark:text-zinc-300">64</td>
                        <td className="text-center text-slate-700 dark:text-zinc-300">32</td>
                        <td className="text-center text-slate-700 dark:text-zinc-300">16</td>
                        <td className="text-center text-slate-700 dark:text-zinc-300">8</td>
                        <td className="text-center text-slate-700 dark:text-zinc-300">4</td>
                        <td className="text-center text-slate-700 dark:text-zinc-300">2</td>
                        <td className="text-center text-slate-700 dark:text-zinc-300">1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-800 mb-2 dark:text-zinc-200">{t('binary.tips.hex2bin.title')}</h4>
              <p className="text-sm text-slate-600 mb-2 dark:text-zinc-400">{t('binary.tips.hex2bin.description')}</p>
              <div className="bg-slate-50 p-3 rounded-md font-mono text-sm dark:bg-zinc-900">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-slate-700 dark:text-zinc-300">{t('binary.tips.hex')}</th>
                        <th className="text-left text-slate-700 dark:text-zinc-300">{t('binary.tips.binary')}</th>
                        <th className="text-left text-slate-700 dark:text-zinc-300">{t('binary.tips.hex')}</th>
                        <th className="text-left text-slate-700 dark:text-zinc-300">{t('binary.tips.binary')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-slate-700 dark:text-zinc-300">0</td>
                        <td className="text-slate-700 dark:text-zinc-300">0000</td>
                        <td className="text-slate-700 dark:text-zinc-300">8</td>
                        <td className="text-slate-700 dark:text-zinc-300">1000</td>
                      </tr>
                      <tr>
                        <td className="text-slate-700 dark:text-zinc-300">1</td>
                        <td className="text-slate-700 dark:text-zinc-300">0001</td>
                        <td className="text-slate-700 dark:text-zinc-300">9</td>
                        <td className="text-slate-700 dark:text-zinc-300">1001</td>
                      </tr>
                      <tr>
                        <td className="text-slate-700 dark:text-zinc-300">2</td>
                        <td className="text-slate-700 dark:text-zinc-300">0010</td>
                        <td className="text-slate-700 dark:text-zinc-300">A</td>
                        <td className="text-slate-700 dark:text-zinc-300">1010</td>
                      </tr>
                      <tr>
                        <td className="text-slate-700 dark:text-zinc-300">3</td>
                        <td className="text-slate-700 dark:text-zinc-300">0011</td>
                        <td className="text-slate-700 dark:text-zinc-300">B</td>
                        <td className="text-slate-700 dark:text-zinc-300">1011</td>
                      </tr>
                      <tr>
                        <td className="text-slate-700 dark:text-zinc-300">4</td>
                        <td className="text-slate-700 dark:text-zinc-300">0100</td>
                        <td className="text-slate-700 dark:text-zinc-300">C</td>
                        <td className="text-slate-700 dark:text-zinc-300">1100</td>
                      </tr>
                      <tr>
                        <td className="text-slate-700 dark:text-zinc-300">5</td>
                        <td className="text-slate-700 dark:text-zinc-300">0101</td>
                        <td className="text-slate-700 dark:text-zinc-300">D</td>
                        <td className="text-slate-700 dark:text-zinc-300">1101</td>
                      </tr>
                      <tr>
                        <td className="text-slate-700 dark:text-zinc-300">6</td>
                        <td className="text-slate-700 dark:text-zinc-300">0110</td>
                        <td className="text-slate-700 dark:text-zinc-300">E</td>
                        <td className="text-slate-700 dark:text-zinc-300">1110</td>
                      </tr>
                      <tr>
                        <td className="text-slate-700 dark:text-zinc-300">7</td>
                        <td className="text-slate-700 dark:text-zinc-300">0111</td>
                        <td className="text-slate-700 dark:text-zinc-300">F</td>
                        <td className="text-slate-700 dark:text-zinc-300">1111</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-800 mb-2 dark:text-zinc-200">{t('binary.tips.bin2hex.title')}</h4>
              <p className="text-sm text-slate-600 mb-2 dark:text-zinc-400">{t('binary.tips.bin2hex.description')}</p>
              <div className="bg-slate-50 p-3 rounded-md font-mono text-sm dark:bg-zinc-900">
                <p className="mb-2 text-slate-800 dark:text-zinc-200">{t('binary.tips.example')}: <span className="font-medium">10110110</span></p>
                <p className="mb-1 text-slate-700 dark:text-zinc-300">1. {t('binary.tips.bin2hex.step1')}: <span className="font-medium">1011 0110</span></p>
                <p className="mb-1 text-slate-700 dark:text-zinc-300">2. {t('binary.tips.bin2hex.step2')}: <span className="font-medium">1011 = B</span>, <span className="font-medium">0110 = 6</span></p>
                <p className="text-slate-700 dark:text-zinc-300">3. {t('binary.tips.bin2hex.step3')}: <span className="font-medium">B6</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
