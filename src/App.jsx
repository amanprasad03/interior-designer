import React, { useState } from "react";
import {
  Upload,
  Search,
  DollarSign,
  FileText,
  AlertCircle,
  Loader2,
  Settings,
  CheckCircle,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  Trash2,
} from "lucide-react";

function App() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchingPrices, setSearchingPrices] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [costEstimate, setCostEstimate] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [validatingKey, setValidatingKey] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setAnalysisResult(null);
      setCostEstimate(null);
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const validateAndSaveApiKey = async () => {
    const trimmedKey = apiKey.trim();

    if (!trimmedKey) {
      setError("Please enter an API key");
      return;
    }

    if (!trimmedKey.startsWith("sk-ant-")) {
      setError(
        'Invalid API key format. Anthropic API keys start with "sk-ant-"'
      );
      return;
    }

    setValidatingKey(true);
    setError(null);

    try {
      // Test the API key with a minimal request
      const testResponse = await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": trimmedKey,
            "anthropic-version": "2023-06-01",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers":
              "Content-Type, x-api-key, anthropic-version",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 10,
            messages: [
              {
                role: "user",
                content: "Hi",
              },
            ],
          }),
        }
      );

      if (testResponse.ok) {
        localStorage.setItem("anthropic_api_key", trimmedKey);
        setApiKeySet(true);
        setShowSettings(false);
        setShowWelcome(false);
        setError(null);
      } else {
        const errorData = await testResponse.json().catch(() => ({}));
        setError(
          `API key validation failed: ${
            errorData.error?.message || "Invalid API key"
          }`
        );
      }
    } catch (err) {
      setError(
        "Failed to validate API key. Please check your internet connection and try again."
      );
    } finally {
      setValidatingKey(false);
    }
  };

  const removeApiKey = () => {
    if (
      window.confirm(
        "Are you sure you want to remove your API key? You will need to enter it again to use the app."
      )
    ) {
      localStorage.removeItem("anthropic_api_key");
      setApiKey("");
      setApiKeySet(false);
      setShowSettings(true);
    }
  };

  const loadApiKey = () => {
    const savedKey = localStorage.getItem("anthropic_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setApiKeySet(true);
      setShowWelcome(false);
    } else {
      setShowWelcome(true);
    }
  };

  React.useEffect(() => {
    loadApiKey();
  }, []);

  const analyzeDrawing = async () => {
    if (!file) return;

    if (!apiKeySet) {
      setError("Please set your Anthropic API key in Settings first");
      setShowSettings(true);
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, x-api-key, anthropic-version",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: file.type,
                    data: base64Data,
                  },
                },
                {
                  type: "text",
                  text: `You are an expert architectural cost estimator analyzing interior elevation drawings. 

Analyze this 2D interior drawing and extract ALL materials, fixtures, finishes, and components that would need to be purchased or installed.

For each item, identify:
1. Item name/description
2. Material type (e.g., ceramic tile, wooden panel, glass, metal fixture)
3. Estimated quantity (area in sqm, linear meters, or units)
4. Location/room
5. Any specifications mentioned (dimensions, brand, model)

Respond ONLY with a valid JSON object in this exact format:
{
  "drawing_type": "interior elevation",
  "rooms": ["list of rooms identified"],
  "items": [
    {
      "category": "flooring|wall_finish|ceiling|fixtures|furniture|millwork|doors_windows",
      "item_name": "specific item name",
      "material": "material type",
      "quantity": number,
      "unit": "sqm|lm|units|pcs",
      "location": "room or area",
      "specifications": "any detailed specs",
      "dimensions": "width x height or area"
    }
  ],
  "notes": "any additional observations"
}

DO NOT include any text outside the JSON. Be thorough and identify every visible material and fixture.`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      let responseText = data.content[0].text;

      responseText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const jsonResponse = JSON.parse(responseText);
      setAnalysisResult(jsonResponse);
    } catch (err) {
      console.error("Error analyzing drawing:", err);
      setError("Failed to analyze drawing. " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const searchPricesAndEstimate = async () => {
    if (!analysisResult || !analysisResult.items) return;

    if (!apiKeySet) {
      setError("Please set your Anthropic API key in Settings first");
      setShowSettings(true);
      return;
    }

    setSearchingPrices(true);
    setError(null);

    try {
      const itemsWithPrices = [];
      const itemsToProcess = analysisResult.items.slice(0, 10);

      for (const item of itemsToProcess) {
        try {
          const priceResponse = await fetch(
            "https://api.anthropic.com/v1/messages",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers":
                  "Content-Type, x-api-key, anthropic-version",
              },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 500,
                messages: [
                  {
                    role: "user",
                    content: `Based on typical 2025 market prices, estimate the cost per ${
                      item.unit
                    } for: ${item.material} - ${item.item_name}.

Consider:
- Material: ${item.material}
- Specifications: ${item.specifications || "standard grade"}
- Unit: ${item.unit}

Respond ONLY with a JSON object:
{
  "item": "${item.item_name}",
  "unit_price_usd": estimated price as a number,
  "price_range_low": lower estimate,
  "price_range_high": higher estimate,
  "assumptions": "brief explanation of estimate basis"
}

DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.`,
                  },
                ],
              }),
            }
          );

          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            let priceText = priceData.content[0].text;
            priceText = priceText
              .replace(/```json\n?/g, "")
              .replace(/```\n?/g, "")
              .trim();

            try {
              const priceInfo = JSON.parse(priceText);

              itemsWithPrices.push({
                ...item,
                unit_price: priceInfo.unit_price_usd,
                price_range: {
                  low: priceInfo.price_range_low,
                  high: priceInfo.price_range_high,
                },
                total_cost: item.quantity * priceInfo.unit_price_usd,
                assumptions: priceInfo.assumptions,
              });
            } catch (parseErr) {
              itemsWithPrices.push({
                ...item,
                unit_price: 0,
                total_cost: 0,
                error: "Price parsing failed",
              });
            }
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (itemErr) {
          console.error(`Error processing item ${item.item_name}:`, itemErr);
          itemsWithPrices.push({
            ...item,
            unit_price: 0,
            total_cost: 0,
            error: "Price estimation failed",
          });
        }
      }

      const totalCost = itemsWithPrices.reduce(
        (sum, item) => sum + (item.total_cost || 0),
        0
      );
      const contingency = totalCost * 0.15;
      const grandTotal = totalCost + contingency;

      setCostEstimate({
        items: itemsWithPrices,
        subtotal: totalCost,
        contingency: contingency,
        grand_total: grandTotal,
      });
    } catch (err) {
      console.error("Error estimating costs:", err);
      setError("Failed to estimate costs. " + err.message);
    } finally {
      setSearchingPrices(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      flooring: "bg-blue-100 text-blue-800",
      wall_finish: "bg-green-100 text-green-800",
      ceiling: "bg-purple-100 text-purple-800",
      fixtures: "bg-yellow-100 text-yellow-800",
      furniture: "bg-pink-100 text-pink-800",
      millwork: "bg-orange-100 text-orange-800",
      doors_windows: "bg-indigo-100 text-indigo-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4'>
      {/* Welcome Screen for First-Time Users */}
      {showWelcome && !apiKeySet && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8'>
            <div className='text-center mb-6'>
              <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
                <Key className='w-8 h-8 text-blue-600' />
              </div>
              <h2 className='text-3xl font-bold text-slate-800 mb-2'>
                Welcome to Interior Drawing Cost Estimator
              </h2>
              <p className='text-slate-600'>
                AI-powered tool to analyze drawings and generate cost estimates
              </p>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
              <h3 className='font-semibold text-blue-900 mb-2 flex items-center gap-2'>
                <Shield className='w-5 h-5' />
                Your API Key is Secure
              </h3>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>✓ Stored only in your browser (localStorage)</li>
                <li>✓ Never sent to our servers</li>
                <li>✓ You have full control</li>
                <li>✓ Can be removed anytime</li>
              </ul>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  Step 1: Get Your Anthropic API Key
                </label>
                <a
                  href='https://console.anthropic.com/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-blue-600 font-medium'
                >
                  <ExternalLink className='w-5 h-5' />
                  Open Anthropic Console
                  <span className='text-xs text-slate-500 ml-auto'>
                    console.anthropic.com
                  </span>
                </a>
                <p className='text-xs text-slate-500 mt-2'>
                  Sign up or log in, then create a new API key in the API Keys
                  section
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  Step 2: Enter Your API Key
                </label>
                <div className='relative'>
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && validateAndSaveApiKey()
                    }
                    placeholder='sk-ant-api03-...'
                    className='w-full px-4 py-3 pr-12 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                  >
                    {showApiKey ? (
                      <EyeOff className='w-5 h-5' />
                    ) : (
                      <Eye className='w-5 h-5' />
                    )}
                  </button>
                </div>
                <p className='text-xs text-slate-500 mt-2'>
                  Your API key starts with "sk-ant-" and is about 100+
                  characters long
                </p>
              </div>

              {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2'>
                  <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              )}

              <button
                onClick={validateAndSaveApiKey}
                disabled={validatingKey || !apiKey.trim()}
                className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {validatingKey ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    Validating API Key...
                  </>
                ) : (
                  <>
                    <CheckCircle className='w-5 h-5' />
                    Validate and Continue
                  </>
                )}
              </button>

              <div className='text-center pt-4 border-t border-slate-200'>
                <p className='text-xs text-slate-500'>
                  Cost: ~$0.02 per drawing analysis • Free tier available
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-3xl font-bold text-slate-800 mb-2'>
                Interior Drawing Cost Estimator
              </h1>
              <p className='text-slate-600'>
                Upload 2D interior drawings to automatically extract materials
                and generate cost estimates
              </p>
              {apiKeySet && (
                <div className='mt-3 flex items-center gap-2 text-sm'>
                  <div className='flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200'>
                    <CheckCircle className='w-4 h-4' />
                    <span className='font-medium'>API Connected</span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                apiKeySet
                  ? "bg-slate-100 hover:bg-slate-200"
                  : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300"
              }`}
            >
              <Settings className='w-5 h-5' />
              {apiKeySet ? "Settings" : "Setup Required"}
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className='mt-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border-2 border-slate-200'>
              <h3 className='font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                <Key className='w-5 h-5' />
                API Key Configuration
              </h3>

              {apiKeySet ? (
                <div className='space-y-4'>
                  <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <div className='flex items-start gap-3'>
                      <CheckCircle className='w-5 h-5 text-green-600 flex-shrink-0 mt-0.5' />
                      <div className='flex-1'>
                        <h4 className='font-semibold text-green-800 mb-1'>
                          API Key Active
                        </h4>
                        <p className='text-sm text-green-700'>
                          Your API key is configured and ready to use
                        </p>
                        <p className='text-xs text-green-600 mt-2 font-mono break-all'>
                          {apiKey.substring(0, 20)}...
                          {apiKey.substring(apiKey.length - 10)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                    <h4 className='font-semibold text-blue-900 mb-2 flex items-center gap-2'>
                      <Shield className='w-4 h-4' />
                      Security Information
                    </h4>
                    <ul className='text-xs text-blue-800 space-y-1'>
                      <li>• Stored locally in your browser only</li>
                      <li>• Not sent to any server except Anthropic's API</li>
                      <li>• Cleared if you clear browser data</li>
                    </ul>
                  </div>

                  <button
                    onClick={removeApiKey}
                    className='w-full px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium'
                  >
                    <Trash2 className='w-4 h-4' />
                    Remove API Key
                  </button>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                    <p className='text-sm text-yellow-800'>
                      <strong>No API key configured.</strong> You need an
                      Anthropic API key to use this application.
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Anthropic API Key
                    </label>
                    <div className='relative'>
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && validateAndSaveApiKey()
                        }
                        placeholder='sk-ant-api03-...'
                        className='w-full px-4 py-3 pr-12 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                      >
                        {showApiKey ? (
                          <EyeOff className='w-5 h-5' />
                        ) : (
                          <Eye className='w-5 h-5' />
                        )}
                      </button>
                    </div>
                    <div className='mt-2 flex items-start gap-2 text-xs text-slate-600'>
                      <ExternalLink className='w-4 h-4 flex-shrink-0 mt-0.5' />
                      <span>
                        Get your API key from{" "}
                        <a
                          href='https://console.anthropic.com/'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:underline font-medium'
                        >
                          console.anthropic.com
                        </a>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={validateAndSaveApiKey}
                    disabled={validatingKey || !apiKey.trim()}
                    className='w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold'
                  >
                    {validatingKey ? (
                      <>
                        <Loader2 className='w-5 h-5 animate-spin' />
                        Validating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className='w-5 h-5' />
                        Validate and Save
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Left Column - Upload & Preview */}
          <div className='space-y-6'>
            {/* Upload Section */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h2 className='text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                <Upload className='w-5 h-5' />
                Upload Drawing
              </h2>

              <label className='block w-full border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors'>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleFileUpload}
                  className='hidden'
                />
                <Upload className='w-12 h-12 mx-auto mb-3 text-slate-400' />
                <p className='text-slate-600 mb-1'>
                  Click to upload interior drawing
                </p>
                <p className='text-sm text-slate-400'>
                  PNG, JPG, PDF up to 10MB
                </p>
              </label>

              {file && (
                <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
                  <p className='text-sm text-slate-700'>
                    <strong>Selected:</strong> {file.name}
                  </p>
                </div>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className='bg-white rounded-xl shadow-lg p-6'>
                <h3 className='text-lg font-semibold text-slate-800 mb-4'>
                  Drawing Preview
                </h3>
                <img
                  src={imagePreview}
                  alt='Drawing preview'
                  className='w-full rounded-lg border border-slate-200'
                />
              </div>
            )}

            {/* Action Buttons */}
            {imagePreview && (
              <div className='space-y-3'>
                <button
                  onClick={analyzeDrawing}
                  disabled={analyzing || !apiKeySet}
                  className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  {analyzing ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      Analyzing Drawing...
                    </>
                  ) : (
                    <>
                      <Search className='w-5 h-5' />
                      Analyze Drawing
                    </>
                  )}
                </button>

                {analysisResult && (
                  <button
                    onClick={searchPricesAndEstimate}
                    disabled={searchingPrices || !apiKeySet}
                    className='w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    {searchingPrices ? (
                      <>
                        <Loader2 className='w-5 h-5 animate-spin' />
                        Searching Prices...
                      </>
                    ) : (
                      <>
                        <DollarSign className='w-5 h-5' />
                        Generate Cost Estimate
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className='space-y-6'>
            {/* Error Display */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3'>
                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                <div>
                  <h4 className='font-semibold text-red-800 mb-1'>Error</h4>
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <div className='bg-white rounded-xl shadow-lg p-6'>
                <h2 className='text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                  <FileText className='w-5 h-5' />
                  Extracted Materials
                </h2>

                <div className='mb-4 p-4 bg-slate-50 rounded-lg'>
                  <p className='text-sm text-slate-600 mb-2'>
                    <strong>Drawing Type:</strong> {analysisResult.drawing_type}
                  </p>
                  <p className='text-sm text-slate-600'>
                    <strong>Rooms:</strong>{" "}
                    {analysisResult.rooms?.join(", ") || "Not specified"}
                  </p>
                  <p className='text-sm text-slate-600 mt-2'>
                    <strong>Total Items:</strong>{" "}
                    {analysisResult.items?.length || 0}
                  </p>
                </div>

                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {analysisResult.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className='border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors'
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <div className='flex-1'>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                              item.category
                            )} mb-2`}
                          >
                            {item.category}
                          </span>
                          <h4 className='font-semibold text-slate-800'>
                            {item.item_name}
                          </h4>
                          <p className='text-sm text-slate-600'>
                            {item.material}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold text-slate-800'>
                            {item.quantity} {item.unit}
                          </p>
                          {item.dimensions && (
                            <p className='text-xs text-slate-500'>
                              {item.dimensions}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className='text-xs text-slate-500 mt-2'>
                        <strong>Location:</strong> {item.location}
                      </p>
                      {item.specifications && (
                        <p className='text-xs text-slate-500 mt-1'>
                          <strong>Specs:</strong> {item.specifications}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Estimate */}
            {costEstimate && (
              <div className='bg-white rounded-xl shadow-lg p-6'>
                <h2 className='text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                  <DollarSign className='w-5 h-5' />
                  Cost Estimate
                </h2>

                <div className='space-y-3 mb-6 max-h-96 overflow-y-auto'>
                  {costEstimate.items.map((item, idx) => (
                    <div
                      key={idx}
                      className='border border-slate-200 rounded-lg p-4'
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <div className='flex-1'>
                          <h4 className='font-semibold text-slate-800'>
                            {item.item_name}
                          </h4>
                          <p className='text-sm text-slate-600'>
                            {item.material}
                          </p>
                          <p className='text-xs text-slate-500 mt-1'>
                            {item.quantity} {item.unit} × $
                            {item.unit_price?.toFixed(2) || "0.00"}/{item.unit}
                          </p>
                          {item.assumptions && (
                            <p className='text-xs text-slate-400 mt-2 italic'>
                              {item.assumptions}
                            </p>
                          )}
                        </div>
                        <div className='text-right'>
                          <p className='text-lg font-bold text-slate-800'>
                            ${item.total_cost?.toFixed(2) || "0.00"}
                          </p>
                          {item.price_range && (
                            <p className='text-xs text-slate-500'>
                              ${item.price_range.low} - ${item.price_range.high}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='border-t border-slate-200 pt-4 space-y-2'>
                  <div className='flex justify-between text-slate-700'>
                    <span>Subtotal:</span>
                    <span className='font-semibold'>
                      ${costEstimate.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between text-slate-700'>
                    <span>Contingency (15%):</span>
                    <span className='font-semibold'>
                      ${costEstimate.contingency.toFixed(2)}
                    </span>
                  </div>
                  <div className='flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-300'>
                    <span>Grand Total:</span>
                    <span>${costEstimate.grand_total.toFixed(2)}</span>
                  </div>
                </div>

                <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                  <p className='text-xs text-yellow-800'>
                    <strong>Note:</strong> Prices are estimates based on typical
                    2025 market rates. Actual costs may vary based on location,
                    supplier, and specifications.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
