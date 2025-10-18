import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Target } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ROICalculator: React.FC = () => {
  const [investment, setInvestment] = useState<number>(10000);
  const [revenue, setRevenue] = useState<number>(25000);
  const [timeframe, setTimeframe] = useState<number>(12);
  const [results, setResults] = useState({
    roi: 0,
    profit: 0,
    roiPercentage: 0,
    monthlyROI: 0,
    breakEven: 0
  });

  const [projectionData, setProjectionData] = useState<Array<{
    month: number;
    revenue: number;
    investment: number;
    profit: number;
  }>>([]);

  useEffect(() => {
    calculateROI();
    generateProjection();
  }, [investment, revenue, timeframe]);

  const calculateROI = () => {
    const profit = revenue - investment;
    const roiValue = investment > 0 ? (profit / investment) : 0;
    const roiPercentage = roiValue * 100;
    const monthlyROI = timeframe > 0 ? roiPercentage / timeframe : 0;
    const breakEven = revenue > 0 ? (investment / revenue) * timeframe : 0;

    setResults({
      roi: roiValue,
      profit,
      roiPercentage,
      monthlyROI,
      breakEven: Math.max(0, breakEven)
    });
  };

  const generateProjection = () => {
    const data = [];
    const monthlyInvestment = investment / timeframe;
    const monthlyRevenue = revenue / timeframe;

    for (let month = 1; month <= Math.min(timeframe, 12); month++) {
      const cumulativeInvestment = monthlyInvestment * month;
      const cumulativeRevenue = monthlyRevenue * month;
      const profit = cumulativeRevenue - cumulativeInvestment;

      data.push({
        month,
        revenue: Math.round(cumulativeRevenue),
        investment: Math.round(cumulativeInvestment),
        profit: Math.round(profit)
      });
    }

    setProjectionData(data);
  };

  const getROIStatus = () => {
    if (results.roiPercentage >= 300) return { color: 'text-green-600', status: 'Excelente' };
    if (results.roiPercentage >= 200) return { color: 'text-green-500', status: 'Muy Bueno' };
    if (results.roiPercentage >= 100) return { color: 'text-yellow-500', status: 'Bueno' };
    if (results.roiPercentage >= 0) return { color: 'text-orange-500', status: 'Regular' };
    return { color: 'text-red-500', status: 'Pérdidas' };
  };

  const roiStatus = getROIStatus();

  return (
    <div className="space-y-8">
      {/* Calculator Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl mb-4">
          <Calculator size={32} className="text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Calculadora de ROI
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Calcula el retorno de inversión de tus campañas de marketing y proyecta resultados futuros
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6">
            Datos de tu Inversión
          </h2>
          
          <div className="space-y-6">
            <div>
              <Input
                label="Inversión Total (€)"
                type="number"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
                icon={<DollarSign size={20} className="text-gray-400" />}
              />
              <p className="text-sm text-gray-500 mt-1">
                Incluye costos de publicidad, herramientas, personal, etc.
              </p>
            </div>

            <div>
              <Input
                label="Ingresos Generados (€)"
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                icon={<TrendingUp size={20} className="text-gray-400" />}
              />
              <p className="text-sm text-gray-500 mt-1">
                Ingresos totales atribuibles a esta inversión
              </p>
            </div>

            <div>
              <Input
                label="Período de Tiempo (meses)"
                type="number"
                value={timeframe}
                onChange={(e) => setTimeframe(Number(e.target.value))}
                icon={<Target size={20} className="text-gray-400" />}
              />
              <p className="text-sm text-gray-500 mt-1">
                Duración de la campaña o período de análisis
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                💡 Tips para un cálculo preciso:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• Incluye todos los costos asociados</li>
                <li>• Considera solo ingresos atribuibles</li>
                <li>• Usa períodos consistentes de medición</li>
                <li>• Actualiza los datos regularmente</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Results Display */}
        <Card>
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6">
            Resultados del Análisis
          </h2>

          <div className="space-y-6">
            {/* ROI Principal */}
            <div className="text-center p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl">
              <div className={`text-4xl font-bold ${roiStatus.color} mb-2`}>
                {results.roiPercentage.toFixed(1)}%
              </div>
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                ROI Total - {roiStatus.status}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Por cada €1 invertido, obtienes €{(1 + results.roi).toFixed(2)}
              </div>
            </div>

            {/* Métricas Adicionales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  €{results.profit.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Beneficio Total
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {results.monthlyROI.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ROI Mensual
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {results.breakEven.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Meses Break-even
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {(results.roiPercentage / 12).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ROI Anualizado
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                className="flex-1"
                onClick={() => {
                  const exportData = {
                    investment,
                    revenue,
                    timeframe,
                    roi: results.roiPercentage,
                    profit: results.profit
                  };
                  console.log('Exportar resultados:', exportData);
                }}
              >
                Exportar Resultados
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setInvestment(10000);
                  setRevenue(25000);
                  setTimeframe(12);
                }}
              >
                Reiniciar
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Projection Chart */}
      <Card>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6">
          Proyección de Resultados
        </h2>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-sm fill-gray-600 dark:fill-gray-400"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-sm fill-gray-600 dark:fill-gray-400"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Ingresos"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="investment" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Inversión"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Beneficio"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Ingresos Acumulados</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Inversión Acumulada</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Beneficio Neto</span>
          </div>
        </div>
      </Card>

      {/* Industry Benchmarks */}
      <Card>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6">
          Benchmarks por Industria
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { industry: 'E-commerce', roi: '400-600%', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
            { industry: 'SaaS/Software', roi: '300-500%', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
            { industry: 'Servicios B2B', roi: '200-400%', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
            { industry: 'Retail Local', roi: '150-300%', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
            { industry: 'Inmobiliaria', roi: '200-350%', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400' },
            { industry: 'Salud/Medicina', roi: '250-450%', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400' },
          ].map((benchmark, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="font-semibold text-gray-900 dark:text-white mb-2">
                {benchmark.industry}
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${benchmark.color}`}>
                {benchmark.roi}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          * Los benchmarks son aproximados y pueden variar según la estrategia, competencia y ejecución.
        </div>
      </Card>
    </div>
  );
};

export default ROICalculator;