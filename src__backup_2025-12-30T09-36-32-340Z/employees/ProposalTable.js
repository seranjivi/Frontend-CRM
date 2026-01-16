import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card } from '../ui/card';

const ProposalTable = ({ proposals }) => {
  const getStatusColor = (status) => {
    const colors = {
      Won: 'bg-emerald-100 text-emerald-700',
      Open: 'bg-amber-100 text-amber-700',
      Lost: 'bg-red-100 text-red-700',
      'On Hold': 'bg-slate-100 text-slate-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <div className="p-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">
          Proposals (most recent first, all months)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-700 px-4 py-2">TITLE</TableHead>
              <TableHead className="text-xs font-semibold text-slate-700 px-4 py-2">CUSTOMER</TableHead>
              <TableHead className="text-xs font-semibold text-slate-700 px-4 py-2">TYPE</TableHead>
              <TableHead className="text-xs font-semibold text-slate-700 px-4 py-2">STATUS</TableHead>
              <TableHead className="text-xs font-semibold text-slate-700 px-4 py-2">DEAL VALUE</TableHead>
              <TableHead className="text-xs font-semibold text-slate-700 px-4 py-2">UPDATED</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-sm text-slate-500">
                  No proposals found
                </TableCell>
              </TableRow>
            ) : (
              proposals.map((proposal, index) => (
                <TableRow key={index} className="hover:bg-slate-50/50">
                  <TableCell className="px-4 py-2.5 text-sm">{proposal.title}</TableCell>
                  <TableCell className="px-4 py-2.5 text-sm">{proposal.customer}</TableCell>
                  <TableCell className="px-4 py-2.5 text-sm">{proposal.type}</TableCell>
                  <TableCell className="px-4 py-2.5">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-sm font-['JetBrains_Mono']">
                    ${proposal.dealValue?.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-sm text-slate-600">
                    {proposal.updated}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ProposalTable;