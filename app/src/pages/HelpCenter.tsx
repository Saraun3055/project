import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Search, MessageCircle, Mail, Book, ChevronRight } from 'lucide-react';

const helpTopics = [
  { id: 'getting-started', title: 'Getting Started', description: 'Learn the basics of using Nexus' },
  { id: 'buying', title: 'Buying NFTs', description: 'How to purchase NFTs on the marketplace' },
  { id: 'selling', title: 'Selling NFTs', description: 'How to list and sell your NFTs' },
  { id: 'wallet', title: 'Wallet & Security', description: 'Managing your wallet and staying secure' },
  { id: 'minting', title: 'Minting NFTs', description: 'Creating your own NFTs' },
  { id: 'collections', title: 'Collections', description: 'Managing NFT collections' },
];

const faqs = [
  { question: 'What is an NFT?', answer: 'NFT stands for Non-Fungible Token. It is a unique digital asset that represents ownership of a specific item or piece of content on the blockchain.' },
  { question: 'How do I buy an NFT?', answer: 'To buy an NFT, you need a compatible wallet (like MetaMask), some cryptocurrency (usually ETH), and browse the marketplace to find an NFT you like. Click Buy and confirm the transaction.' },
  { question: 'What are gas fees?', answer: 'Gas fees are transaction fees paid to the blockchain network for processing your transactions. These fees vary based on network congestion.' },
  { question: 'How do I create an NFT?', answer: 'Click "Create" in the navigation, upload your image, add details like name and description, set properties if desired, and click Create to mint your NFT.' },
  { question: 'Can I edit my NFT after creation?', answer: 'Once an NFT is created on the blockchain, the metadata cannot be changed. However, you can update the listing details on the marketplace.' },
  { question: 'What wallets are supported?', answer: 'We support MetaMask, WalletConnect, and other Ethereum-compatible wallets.' },
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Help Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Find answers to common questions and get support</p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              type="search" 
              placeholder="Search for help..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {helpTopics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{topic.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{topic.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Common questions from our community</p>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-gray-200 dark:border-slate-800">
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-400">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="p-6">
              <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Live Chat</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Chat with our support team</p>
              <Button variant="outline" size="sm">Start Chat</Button>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Email Support</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Get help via email</p>
              <Button variant="outline" size="sm">Send Email</Button>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Book className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Documentation</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Browse detailed guides</p>
              <Button variant="outline" size="sm">View Docs</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;