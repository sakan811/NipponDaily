<template>
  <DocsBook slug="api">
    <template #lede>
      Every response is <code>{ success, data, timestamp }</code>. Handlers live
      in <code>server/api/</code> and <code>server/routes/</code>, and this
      table is the list in <code>shared/endpoints.ts</code>.
    </template>

    <h2>Endpoints</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Returns</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="endpoint in API_ENDPOINTS" :key="endpoint.path">
            <td>
              <code>{{ endpoint.method }} {{ endpoint.path }}</code
              ><template v-if="endpoint.query"
                ><br /><code>{{ endpoint.query }}</code></template
              >
            </td>
            <td><RichText :text="endpoint.returns" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      There is no request rate limiting on any endpoint. A day's words are
      served only once it is open (<NuxtLink to="/docs/words"
        >Daily words</NuxtLink
      >); what each failure looks like on a page is in
      <NuxtLink to="/docs/error-states">Error and fallback states</NuxtLink>.
    </p>

    <h2>Example</h2>
    <p><code>GET /api/daily-word?date=2026-10-01</code>, abridged</p>
    <pre><code>{{ example }}</code></pre>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
import RichText from "../../components/RichText.vue";
import { API_ENDPOINTS } from "~~/shared/endpoints";

const example = `{
  "success": true,
  "data": {
    "entry": {
      "date": "2026-10-01",
      "term": "電話",
      "kana": "でんわ",
      "meaning": "a telephone",
      "level": "N5",
      "pos": ["noun (common) (futsuumeishi)"],
      "stratum": "kango",
      "processes": ["compound", "wasei"],
      "headline": "…",
      "morphemes": [{ "text": "電", "reading": "でん", "meaning": "electric" }],
      "sources": [{ "quote": "…" }],
      "wiktionaryRev": 92203082
    },
    "prev": { "date": "2026-09-30", "term": "蕎麦" },
    "next": { "date": "2026-10-02", "term": "友達" }
  },
  "timestamp": "2026-10-01T00:00:00Z"
}`;
</script>
