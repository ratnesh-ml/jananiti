# Free Civic Map Implementation

JanaNiti uses **Leaflet** with interactive OpenStreetMap raster tiles for the civic-map surface. This removes the need for a Google Maps API key or paid Google Maps billing. The implementation provides human-initiated pan, zoom, marker selection, locality fallback, visible OpenStreetMap attribution, and a map-load fallback; it does not prefetch tiles, provide offline downloads, or fabricate mapped civic records.

The map renders a marker only when a civic record already has a finite, voluntarily stored latitude and longitude pair. A tap on the map is an orientation aid only: it communicates an unsaved point to the interface and does not automatically persist or publish an exact location. The report flow remains locality-first until a separate location-data policy is reviewed.

| Requirement | Implementation decision |
|---|---|
| No paid maps API | Leaflet is open source; no Google Maps key is called. |
| Tile attribution | The map displays `© OpenStreetMap contributors`. |
| No background loading | Tiles load only from active user map interaction. |
| Privacy | Locality labels remain the submission default; map taps are not saved. |
| Resilience | When map tiles fail, the UI preserves locality-based discovery and record access. |

The OpenStreetMap standard tile service is community-funded and best-effort, so the implementation avoids offline functionality, bulk downloads, and prefetching. If sustained public traffic grows beyond appropriate standard-tile use, the project must select a compliant tile provider or self-hosted alternative before changing this policy.

Sources: [Leaflet Quick Start](https://leafletjs.com/examples/quick-start/) and [OpenStreetMap Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/).
