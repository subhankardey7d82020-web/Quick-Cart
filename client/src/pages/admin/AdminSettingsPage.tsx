import React, { useState, useEffect } from 'react';
import { Settings, Save, Sparkles, Upload } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const { settings, refreshSettings } = useSettings();
  const { success, error } = useToast();

  const [formData, setFormData] = useState<any>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (file: File, targetField: string) => {
    try {
      if (targetField === 'logoUrl') setUploadingLogo(true);
      if (targetField === 'heroImageUrl') setUploadingHero(true);

      const res = await api.adminUploadImage(file);
      if (res?.url) {
        setFormData((prev: any) => ({ ...prev, [targetField]: res.url }));
        success('Asset uploaded.');
      }
    } catch (err: any) {
      error(err.message || 'Upload failed.');
    } finally {
      setUploadingLogo(false);
      setUploadingHero(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.adminUpdateSettings(formData);
      await refreshSettings();
      success('Storefront settings updated successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-4 border-b border-sand-200">
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
          Store Configuration
        </p>
        <h1 className="font-serif text-3xl text-noir-900 font-normal">
          Boutique Branding & Operations
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* General Store Identity */}
        <div className="p-6 bg-white border border-sand-200 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 pb-2 border-b border-sand-200">
            Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                Store Tagline
              </label>
              <input
                type="text"
                name="storeTagline"
                value={formData.storeTagline || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
              />
            </div>
          </div>
        </div>

        {/* Currency & Logistics Thresholds */}
        <div className="p-6 bg-white border border-sand-200 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 pb-2 border-b border-sand-200">
            Currency & Logistics Charges
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                name="currencySymbol"
                value={formData.currencySymbol || '₹'}
                onChange={handleChange}
                className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs font-bold text-center"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                Currency Code
              </label>
              <input
                type="text"
                name="currencyCode"
                value={formData.currencyCode || 'INR'}
                onChange={handleChange}
                className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs uppercase text-center"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                Base Shipping Charge (₹)
              </label>
              <input
                type="number"
                name="shippingCharges"
                value={formData.shippingCharges || '99'}
                onChange={handleChange}
                className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs text-center"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                name="freeShippingThreshold"
                value={formData.freeShippingThreshold || '1499'}
                onChange={handleChange}
                className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs text-center font-bold"
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar Settings */}
        <div className="p-6 bg-white border border-sand-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-sand-200">
            <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900">
              Announcement Bar
            </h3>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.announcementActive === 'true'}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    announcementActive: e.target.checked ? 'true' : 'false',
                  }))
                }
                className="w-4 h-4 text-noir-900"
              />
              <span className="font-semibold text-noir-800">Show Announcement Bar</span>
            </label>
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
              Announcement Message
            </label>
            <input
              type="text"
              name="announcementText"
              value={formData.announcementText || ''}
              onChange={handleChange}
              className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
            />
          </div>
        </div>

        {/* Hero Banner Configuration */}
        <div className="p-6 bg-white border border-sand-200 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 pb-2 border-b border-sand-200">
            Homepage Hero Campaign
          </h3>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
              Hero Headline
            </label>
            <input
              type="text"
              name="heroHeadline"
              value={formData.heroHeadline || ''}
              onChange={handleChange}
              className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
              Hero Subheadline
            </label>
            <textarea
              rows={2}
              name="heroSubheadline"
              value={formData.heroSubheadline || ''}
              onChange={handleChange}
              className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                name="heroCtaText"
                value={formData.heroCtaText || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                Hero Campaign Image Link
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="heroImageUrl"
                  value={formData.heroImageUrl || ''}
                  onChange={handleChange}
                  className="flex-1 p-2 bg-cream-50/50 border border-sand-300 text-xs"
                />
                <label className="px-3 py-2 bg-noir-900 text-cream-50 text-[10px] uppercase font-semibold cursor-pointer flex items-center space-x-1">
                  <Upload className="w-3 h-3" />
                  <span>{uploadingHero ? '...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'heroImageUrl')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information & Concierge */}
        <div className="p-6 bg-white border border-sand-200 shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 pb-2 border-b border-sand-200">
            Contact & Concierge Coordinates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                Concierge Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
                Concierge Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone || ''}
                onChange={handleChange}
                className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider font-semibold text-noir-800 mb-1">
              Boutique Address
            </label>
            <input
              type="text"
              name="contactAddress"
              value={formData.contactAddress || ''}
              onChange={handleChange}
              className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs"
            />
          </div>
        </div>

        {/* Save Changes CTA */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-noir-900 hover:bg-noir-800 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-accent" />
            <span>{saving ? 'Publishing Changes...' : 'Save & Publish Store Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
