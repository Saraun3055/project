import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calculator, DollarSign, Receipt, AlertTriangle } from 'lucide-react';

const TaxInfo = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tax Information</h1>
          <p className="text-gray-500 dark:text-gray-400">Understanding your tax obligations when trading NFTs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Capital Gains</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selling NFTs for profit may result in capital gains tax. Keep track of your purchase and sale prices.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Receipt className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Income Tax</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If you create and sell NFTs as a business, the income may be subject to income tax.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Important Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">Keep records of all your NFT transactions</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">Report capital gains on your tax return</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">Consult a tax professional for personalized advice</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="q1" className="border-gray-200 dark:border-slate-800">
                <AccordionTrigger>Do I need to pay taxes when I buy an NFT?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400">
                  Generally, purchasing NFTs for personal use is not a taxable event. However, if you purchase NFTs as an investment or for business purposes, there may be tax implications.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2" className="border-gray-200 dark:border-slate-800">
                <AccordionTrigger>How are NFT sales taxed?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400">
                  When you sell an NFT for more than you paid, the profit is considered a capital gain. Short-term gains (held less than a year) are taxed as ordinary income, while long-term gains have lower tax rates.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3" className="border-gray-200 dark:border-slate-800">
                <AccordionTrigger>What if I receive NFTs as a gift?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400">
                  Receiving NFTs as gifts may have gift tax implications. The cost basis of the NFT transfers to the recipient, meaning they'll pay taxes on any gain when they sell.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 text-center">
          This information is for educational purposes only and does not constitute tax advice. 
          Please consult a qualified tax professional for your specific situation.
        </p>
      </div>
    </div>
  );
};

export default TaxInfo;