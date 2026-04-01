import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import {
  ImagePlus,
  X,
  Plus,
  Info,
  AlertCircle,
  Upload,
  Link,
  Palette,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Trait {
  trait_type: string;
  value: string;
}

const Create = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [collection, setCollection] = useState('');
  const [supply, setSupply] = useState('1');
  const [blockchain, setBlockchain] = useState('ethereum');
  const [isExplicit, setIsExplicit] = useState(false);
  const [traits, setTraits] = useState<Trait[]>([]);
  const [newTraitType, setNewTraitType] = useState('');
  const [newTraitValue, setNewTraitValue] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.onerror = () => {
        toast.error('Failed to read image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTrait = () => {
    if (newTraitType && newTraitValue) {
      setTraits([...traits, { trait_type: newTraitType, value: newTraitValue }]);
      setNewTraitType('');
      setNewTraitValue('');
    }
  };

  const handleRemoveTrait = (index: number) => {
    setTraits(traits.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!token) {
      toast.error('Please sign in to create an NFT');
      navigate('/login');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', name);
      formData.append('description', description);
      formData.append('image', selectedFile);
      formData.append('externalLink', externalLink);
      formData.append('collection', collection || 'Unnamed Collection');
      formData.append('blockchain', blockchain);
      formData.append('supply', supply);
      formData.append('traits', JSON.stringify(traits));

      const response = await fetch(`${API_URL}/nfts/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create NFT');
      }

      toast.success('NFT created successfully!');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create NFT');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return selectedFile && name.trim() && description.trim();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create New NFT</h1>
          <p className="text-gray-500 dark:text-gray-400">Create and mint your unique digital collectible</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">Image *</Label>
                <span className="text-sm text-gray-500 dark:text-gray-400">Required</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">File types supported: JPG, PNG, GIF, SVG, WEBP. Max size: 50 MB</p>

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Drag and drop or click to upload</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recommended size: 1000x1000px</p>
                </div>
              ) : (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="w-full aspect-square object-cover rounded-xl" />
                  <button onClick={handleRemoveFile} className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-slate-700">
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              <Label htmlFor="name" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Name *</Label>
              <Input id="name" placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" />
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              <Label htmlFor="description" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Description *</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">The description will be included on the item's detail page</p>
              <Textarea id="description" placeholder="Provide a detailed description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-[120px] bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" />
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              <Label htmlFor="externalLink" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 block">External Link</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Include a link to this item on your website</p>
              <div className="relative mt-2">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" />
                <Input id="externalLink" placeholder="https://yoursite.com/item/123" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} className="pl-10 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Collection</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This is the collection where your item will appear</p>
              <Select value={collection} onValueChange={setCollection}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800">
                  <SelectItem value="new">+ Create new collection</SelectItem>
                  <SelectItem value="bored-ape">Bored Ape Yacht Club</SelectItem>
                  <SelectItem value="cryptopunks">CryptoPunks</SelectItem>
                  <SelectItem value="azuki">Azuki</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Accordion type="single" collapsible className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800">
              <AccordionItem value="properties" className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Properties</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Textual traits that show up as rectangles</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-3">
                    {traits.map((trait, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{trait.trait_type}</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{trait.value}</p>
                        </div>
                        <button onClick={() => handleRemoveTrait(index)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-3">
                      <Input placeholder="Trait type (e.g., Color)" value={newTraitType} onChange={(e) => setNewTraitType(e.target.value)} className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" />
                      <Input placeholder="Value (e.g., Red)" value={newTraitValue} onChange={(e) => setNewTraitValue(e.target.value)} className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" />
                      <Button type="button" variant="outline" onClick={handleAddTrait} disabled={!newTraitType || !newTraitValue}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Supply</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The number of items that can be minted</p>
              <Input type="number" min="1" value={supply} onChange={(e) => setSupply(e.target.value)} className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" />
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 block">Blockchain</Label>
              <Select value={blockchain} onValueChange={setBlockchain}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800">
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="optimism">Optimism</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Explicit & Sensitive Content</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Set this item as explicit content</p>
                </div>
                <Switch checked={isExplicit} onCheckedChange={setIsExplicit} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Preview</h3>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
                      <ImagePlus className="w-12 h-12 text-gray-300 dark:text-slate-600" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{collection || 'Unnamed Collection'}</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{name || 'Unnamed Item'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Price:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Not for sale</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">Create Your NFT</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">Your NFT will be saved to the database.</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-300 mb-1">Important</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">Once created, your NFT cannot be edited.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={handleCreate} disabled={!isFormValid() || isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold disabled:opacity-50">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create NFT'
                  )}
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)} className="w-full py-6 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-900">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
