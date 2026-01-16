import React from 'react';
import { Card, CardContent } from '../ui/card';

const KPICards = ({ kpis }) => {
  const kpiData = [
    {
      label: 'Total Proposals',
      value: kpis?.totalProposals || 0,
      className: 'col-span-1'
    },
    {
      label: 'Proposals Won',
      value: kpis?.proposalsWon || 0,
      className: 'col-span-1'
    },
    {
      label: 'Win Rate (%)',
      value: `${kpis?.winRate || 0}%`,
      className: 'col-span-1'
    },
    {
      label: 'Total Deal Value',
      value: `$${(kpis?.totalDealValue || 0).toLocaleString()}`,
      className: 'col-span-1'
    },
    {
      label: 'Average Deal',
      value: `$${(kpis?.averageDeal || 0).toLocaleString()}`,
      className: 'col-span-1'
    },
    {
      label: 'Open',
      value: kpis?.open || 0,
      className: 'col-span-1'
    },
    {
      label: 'Lost',
      value: kpis?.lost || 0,
      className: 'col-span-1'
    },
    {
      label: 'On Hold',
      value: kpis?.onHold || 0,
      className: 'col-span-1'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {kpiData.map((kpi, index) => (
        <Card key={index} className={`${kpi.className} border-slate-200 shadow-sm`}>
          <CardContent className="p-4">
            <div className="text-xs text-slate-600 mb-1">{kpi.label}</div>
            <div className="text-2xl font-bold text-slate-900 font-['JetBrains_Mono']">
              {kpi.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KPICards;