import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import useCircleStore from '@/store/circleStore';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react';
import { validateCircleData, validateMemberData } from '@/lib/utils/validators';

export default function CreateCircle() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { createCircle, loading } = useCircleStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    frequency: 'weekly',
    totalRounds: '',
    penaltyRate: 0.1,
  });
  
  const [members, setMembers] = useState([
    { name: '', email: '', phone: '', address: user?.addr || '' },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const addMember = () => {
    setMembers([...members, { name: '', email: '', phone: '', address: '' }]);
  };

  const removeMember = (index) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleNext = () => {
    if (step === 1) {
      try {
        validateCircleData({
          ...formData,
          contributionAmount: parseFloat(formData.contributionAmount),
          totalRounds: parseInt(formData.totalRounds),
        });
        setStep(2);
      } catch (error) {
        toast.error(error.message);
      }
    } else if (step === 2) {
      const validMembers = members.filter(m => m.name && m.address);
      if (validMembers.length < 2) {
        toast.error('You need at least 2 members (including yourself)');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    try {
      const validMembers = members.filter(m => m.name && m.address);
      
      const circleData = {
        ...formData,
        contributionAmount: parseFloat(formData.contributionAmount),
        totalRounds: parseInt(formData.totalRounds),
        members: validMembers,
      };

      const { circleId } = await createCircle(circleData);
      
      toast.success('Circle created successfully!');
      router.push(`/circles/${circleId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to create circle');
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
          <p className="text-gray-600">You need to be logged in to create a circle</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Circle</h1>
          <p className="text-gray-600">Set up your savings circle in 3 easy steps</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s <= step
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      s < step ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm font-medium text-gray-700">Basic Info</span>
            <span className="text-sm font-medium text-gray-700">Members</span>
            <span className="text-sm font-medium text-gray-700">Review</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Circle Details</h2>
              
              <div>
                <label className="label">Circle Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., Family Savings 2024"
                  required
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input"
                  rows="3"
                  placeholder="What is this circle for?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Contribution Amount (USD) *</label>
                  <input
                    type="number"
                    name="contributionAmount"
                    value={formData.contributionAmount}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="50"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="label">Frequency *</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Total Rounds *</label>
                <input
                  type="number"
                  name="totalRounds"
                  value={formData.totalRounds}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="12"
                  min="2"
                  max="52"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Number of payout rounds (one per member)
                </p>
              </div>

              <div>
                <label className="label">Penalty Rate</label>
                <select
                  name="penaltyRate"
                  value={formData.penaltyRate}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="0.05">5%</option>
                  <option value="0.10">10%</option>
                  <option value="0.15">15%</option>
                  <option value="0.20">20%</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Penalty for late payments (taken from security deposit)
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add Members</h2>
                <button
                  onClick={addMember}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="space-y-4">
                {members.map((member, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">
                        Member {index + 1} {index === 0 && '(You)'}
                      </h3>
                      {index > 0 && (
                        <button
                          onClick={() => removeMember(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Name *</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          className="input"
                          placeholder="Full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="label">Flow Address *</label>
                        <input
                          type="text"
                          value={member.address}
                          onChange={(e) => handleMemberChange(index, 'address', e.target.value)}
                          className="input"
                          placeholder="0x..."
                          required
                          disabled={index === 0}
                        />
                      </div>

                      <div>
                        <label className="label">Email</label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                          className="input"
                          placeholder="email@example.com"
                        />
                      </div>

                      <div>
                        <label className="label">Phone</label>
                        <input
                          type="tel"
                          value={member.phone}
                          onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                          className="input"
                          placeholder="+234..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Review & Confirm</h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Circle Details</h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-gray-600">Name</dt>
                      <dd className="font-medium">{formData.name}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Contribution</dt>
                      <dd className="font-medium">${formData.contributionAmount}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Frequency</dt>
                      <dd className="font-medium capitalize">{formData.frequency}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Total Rounds</dt>
                      <dd className="font-medium">{formData.totalRounds}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Security Deposit</dt>
                      <dd className="font-medium">${parseFloat(formData.contributionAmount) * 2}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Penalty Rate</dt>
                      <dd className="font-medium">{(formData.penaltyRate * 100).toFixed(0)}%</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Members ({members.filter(m => m.name).length})</h3>
                  <ul className="space-y-2 text-sm">
                    {members.filter(m => m.name).map((member, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{member.name}</span>
                        <span className="text-gray-600">{member.address?.slice(0, 10)}...</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Total per member</span>
                    <span className="font-semibold">
                      ${parseFloat(formData.contributionAmount) * parseInt(formData.totalRounds)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total pool</span>
                    <span className="font-semibold">
                      ${parseFloat(formData.contributionAmount) * parseInt(formData.totalRounds) * members.filter(m => m.name).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Once created, circle rules cannot be changed. All members must pay a security deposit of ${parseFloat(formData.contributionAmount) * 2} before the circle starts.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Create Circle</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
