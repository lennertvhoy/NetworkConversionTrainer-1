import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/languageContext";

export default function Home() {
  const { t } = useLanguage();
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
          {t('home.title')}
        </h1>
        <p className="text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>{t('home.binarySection.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-zinc-400 mb-6">
              {t('home.binarySection.description')}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                {t('binary.type.bin2dec')}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                {t('binary.type.bin2hex')}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                {t('binary.type.hex2bin')}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                {t('binary.type.dec2bin')}
              </span>
            </div>
            <Link href="/binary">
              <Button className="w-full bg-primary hover:bg-blue-600">
                {t('home.binarySection.button')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <CardTitle>{t('home.subnettingSection.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-zinc-400 mb-6">
              {t('home.subnettingSection.description')}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                {t('subnetting.type.basic')}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                {t('subnetting.type.vlsm')}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                {t('subnetting.type.wildcard')}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                {t('subnetting.type.network')}
              </span>
            </div>
            <Link href="/subnetting">
              <Button className="w-full bg-primary hover:bg-blue-600">
                {t('home.subnettingSection.button')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('home.about.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-zinc-400 mb-4">
            {t('home.about.description')}
          </p>
          <p className="text-slate-600 dark:text-zinc-400 mb-4">
            {t('home.about.practiceExercises')}
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-zinc-400 mb-4">
            <li>{t('home.about.exercise1')}</li>
            <li>{t('home.about.exercise2')}</li>
            <li>{t('home.about.exercise3')}</li>
            <li>{t('home.about.exercise4')}</li>
            <li>{t('home.about.exercise5')}</li>
          </ul>
          <p className="text-slate-600 dark:text-zinc-400">
            {t('home.about.chooseArea')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}