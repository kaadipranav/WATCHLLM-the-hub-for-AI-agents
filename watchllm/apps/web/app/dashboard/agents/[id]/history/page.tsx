"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { apiGet, type VersionItem } from "@/lib/api";

type Branch = {
  id: string;
  name: string;
  head_version_id: string | null;
  created_at: number;
};

export default function AgentHistoryPage() {
  const params = useParams<{ id: string }>();
  const agentId = params.id;

  const [branch, setBranch] = useState("main");
  const branches = useSWR(`/api/v1/agents/${agentId}/branches`, (url: string) => apiGet<Branch[]>(url));
  const versions = useSWR(`/api/v1/agents/${agentId}/versions?branch=${branch}`, (url: string) => apiGet<VersionItem[]>(url));

  const withDelta = useMemo(
    () => {
      const rows = versions.data ?? [];
      return rows.map((row, index) => {
        const prev = rows[index + 1];
        const delta = row.severity !== null && prev?.severity !== null ? row.severity - prev.severity : null;
        return { ...row, delta };
      });
    },
    [versions.data],
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Version history</h1>
        <select value={branch} onChange={(event) => setBranch(event.target.value)} className="rounded border border-white/10 bg-[#111] px-3 py-2 text-sm">
          {(branches.data ?? []).map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
          {!branches.data?.length ? <option value="main">main</option> : null}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-[#111]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0b0b0b] text-gray-400">
            <tr>
              <th className="px-4 py-3">Commit</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Severity delta</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {withDelta.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-mono text-xs">{row.id.slice(0, 7)}</td>
                <td className="px-4 py-3 text-xs text-gray-300">{row.commit_message ?? "No message"}</td>
                <td className="px-4 py-3 text-xs">
                  {row.delta === null ? (
                    <span className="text-gray-400">-</span>
                  ) : row.delta < 0 ? (
                    <span className="font-mono text-emerald-300">{row.delta.toFixed(2)}</span>
                  ) : (
                    <span className="font-mono text-red-300">+{row.delta.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(row.created_at * 1000).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs">
                  <Link href={`/dashboard/agents/${agentId}/versions/${row.id}/diff`} className="text-accent hover:underline">
                    View diff
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
