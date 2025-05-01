import React, { useEffect, useState } from 'react';

interface AssertionResult {
  title: string;
  fullName: string;
  status: 'passed' | 'failed';
  duration?: number;
  failureMessages?: string[];
}

interface TestSuite {
  assertionResults: AssertionResult[];
  name: string;
}

interface VitestReport {
  testResults: TestSuite[];
}

interface CoverageSummary {
  total: {
    lines: { pct: number };
    functions: { pct: number };
    branches: { pct: number };
    statements: { pct: number };
  };
}

const TestsPage: React.FC = () => {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [coverage, setCoverage] = useState<CoverageSummary | null>(null);
  const [expandedSuites, setExpandedSuites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/vitest-report.json')
    .then(res => res.json())
    .then((data: VitestReport) => {
      setSuites(data.testResults);
    });

    fetch('/coverage/coverage-summary.json')
    .then(res => res.json())
    .then((data: CoverageSummary) => {
      setCoverage(data);
    });
  }, []);

  const toggleSuite = (name: string) => {
    setExpandedSuites(prev => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const renderProgress = (label: string, value: number) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm font-medium text-gray-300 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${
            value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Результаты тестов</h1>

      {coverage && (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Покрытие кода</h2>
          {renderProgress('Строки', coverage.total.lines.pct)}
          {renderProgress('Функции', coverage.total.functions.pct)}
          {renderProgress('Ветвления', coverage.total.branches.pct)}
          {renderProgress('Выражения', coverage.total.statements.pct)}
        </div>
      )}

      {suites.length === 0 ? (
        <p className="text-gray-500">Нет данных о тестах.</p>
      ) : (
        <div className="space-y-6">
          {suites.map((suite, i) => (
            <div key={i} className="border border-gray-600 rounded overflow-hidden">
              <button
                onClick={() => toggleSuite(suite.name)}
                className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold"
              >
                {expandedSuites[suite.name] ? '▼' : '▶'} {suite.name.split('/').slice(-1)[0]}
              </button>

              {expandedSuites[suite.name] && (
                <table className="w-full table-auto text-sm bg-gray-900">
                  <thead className="bg-gray-700 text-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2 border">Тест</th>
                    <th className="text-left px-4 py-2 border">Статус</th>
                    <th className="text-left px-4 py-2 border">Время</th>
                  </tr>
                  </thead>
                  <tbody>
                  {suite.assertionResults.map((test, idx) => (
                    <tr key={idx} className="hover:bg-gray-800">
                      <td className="px-4 py-2 border text-gray-100">{test.title}</td>
                      <td
                        className={`px-4 py-2 border font-medium ${
                          test.status === 'passed' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {test.status}
                      </td>
                      <td className="px-4 py-2 border text-gray-300">
                        {test.duration ? `${test.duration.toFixed(1)} ms` : '–'}
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestsPage;
