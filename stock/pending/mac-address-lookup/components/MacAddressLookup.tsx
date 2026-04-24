"use client";

import { useState, useCallback } from "react";

interface OuiEntry {
  prefix: string;
  vendor: string;
  country?: string;
  type?: string;
}

const OUI_DATABASE: OuiEntry[] = [
  // Apple
  { prefix: "00:03:93", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0A:27", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0A:95", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:11:24", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:14:51", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:16:CB", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:17:F2", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:19:E3", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1B:63", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1C:B3", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1D:4F", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1E:52", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1E:C2", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1F:5B", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1F:F3", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:21:E9", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:22:41", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:12", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:32", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:6C", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:DF", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:24:36", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:25:00", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:25:4B", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:25:BC", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:08", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:4A", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:B9", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:BB", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:30:65", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "00:50:E4", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "04:0C:CE", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "04:15:52", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "04:26:65", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "04:48:9A", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "04:52:F3", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "04:54:53", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "04:69:F8", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "04:D3:CF", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "04:F7:E4", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "08:00:07", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "08:66:98", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "0C:3E:9F", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "0C:74:C2", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "0C:BC:9F", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "10:40:F3", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "14:10:9F", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "14:5A:05", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "18:AF:61", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "20:78:F0", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "28:CF:DA", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "34:C0:59", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "38:CA:DA", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "3C:15:C2", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "40:33:1A", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "44:D8:84", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "48:D7:05", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "50:EA:D6", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "54:26:96", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "60:03:08", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "68:96:7B", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "70:56:81", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "74:E1:B6", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "78:CA:39", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "7C:D1:C3", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "80:BE:05", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "84:29:99", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "88:63:DF", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "8C:00:6D", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "90:27:E4", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "98:B8:E3", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "A4:67:06", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "A8:86:DD", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "AC:29:3A", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "B4:F0:AB", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "B8:FF:61", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "BC:3B:AF", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "C0:CE:CD", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "C4:2C:03", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "C8:33:4B", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "CC:29:F5", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "D0:03:4B", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "D4:61:9D", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "D8:30:62", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "DC:2B:2A", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "E0:AC:CB", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "E4:CE:8F", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "E8:04:0B", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "F0:B4:79", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "F4:F1:5A", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "F8:27:93", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  { prefix: "FC:25:3F", vendor: "Apple, Inc.", country: "US", type: "NIC" },
  // Samsung
  { prefix: "00:00:F0", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:12:47", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:15:99", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:17:C9", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:17:D5", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:18:AF", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:1A:8A", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:1B:98", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:1C:43", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:1D:25", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:1E:7D", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:1F:CC", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:21:19", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:21:D2", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:23:39", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:23:D6", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:24:54", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:24:91", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:25:38", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:25:66", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "00:26:37", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "08:08:C2", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "10:30:47", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "18:22:7E", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "20:13:E0", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "28:27:BF", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "30:19:66", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "38:16:D1", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "40:0E:85", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "50:32:37", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "5C:0A:5B", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "60:6B:BD", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "68:EB:AE", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "70:28:8B", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "78:1F:DB", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "84:25:DB", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "8C:77:12", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "94:51:03", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "9C:02:98", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "A0:82:1F", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "B0:72:BF", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "BC:14:85", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "C0:BD:D1", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "D0:17:C2", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "D0:22:BE", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "E8:50:8B", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "F4:42:8F", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  { prefix: "FC:A1:83", vendor: "Samsung Electronics Co., Ltd.", country: "KR", type: "NIC" },
  // Intel
  { prefix: "00:02:B3", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:03:47", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:04:23", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:07:E9", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:0C:F1", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:0E:35", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:11:11", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:12:F0", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:13:02", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:13:20", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:13:E8", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:15:00", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:16:6F", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:16:76", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:16:EA", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:16:EB", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:18:DE", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:19:D1", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:1B:21", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:1C:BF", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:1D:E0", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:1E:64", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:1E:65", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:1F:3B", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:1F:3C", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:21:5C", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:21:6A", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:22:FA", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:23:14", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:24:D7", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "00:27:10", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "34:13:E8", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "40:25:C2", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "48:51:B7", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "50:76:AF", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "5C:51:4F", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "60:57:18", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "68:05:CA", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "6C:88:14", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "74:E5:0B", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "7C:7A:91", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "80:19:34", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "84:3A:4B", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "90:E2:BA", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "A0:88:B4", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "A4:C3:F0", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "B0:35:9F", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "C8:D9:D2", vendor: "Intel Corporate", country: "US", type: "NIC" },
  { prefix: "D8:FC:93", vendor: "Intel Corporate", country: "US", type: "NIC" },
  // Cisco
  { prefix: "00:00:0C", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:00:E8", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:01:42", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:01:43", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:01:63", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:01:64", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:01:96", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:01:97", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:01:C7", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:01:C9", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:02:16", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:02:17", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:02:3D", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:03:6B", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:03:6C", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:03:E3", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:04:27", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:04:28", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:04:6D", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:04:9B", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:04:DD", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:05:00", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:05:31", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:05:32", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:05:5E", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:05:73", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:05:74", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0A:41", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0A:42", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0B:45", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0B:46", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0C:30", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0C:31", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0D:28", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0D:29", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0D:BC", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0D:BD", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0E:38", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0E:39", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0E:84", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0E:85", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0F:23", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0F:24", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0F:90", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0F:F7", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:10:07", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:10:0B", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:10:11", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:10:14", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:10:29", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:10:54", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:10:79", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:10:7B", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:10:F6", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:11:20", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:11:21", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:11:5C", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:11:92", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:11:93", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:13:19", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:13:5F", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:13:60", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:13:7F", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:13:80", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:13:C3", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:14:1B", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:14:A9", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:14:BF", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:15:2B", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:15:63", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:15:C6", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:15:C7", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:15:F9", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:16:46", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:16:47", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:16:C7", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:16:C8", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:17:0E", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:17:0F", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:17:5A", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:17:94", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:17:95", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:18:18", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:18:19", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:18:73", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:18:74", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:18:B9", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:19:06", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:19:07", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:19:2F", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:19:30", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:19:55", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:19:56", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1A:2F", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1A:30", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1A:6C", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1A:6D", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1A:A1", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1A:A2", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1A:E2", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1A:E3", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1B:2A", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1B:2B", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1B:53", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1B:54", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1B:8F", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1B:90", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1B:D4", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1B:D5", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1C:10", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1C:57", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1C:58", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1C:F6", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1D:45", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1D:46", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1D:70", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1D:71", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1D:A1", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1D:A2", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1E:13", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1E:14", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1E:49", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1E:4A", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1E:7A", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1E:79", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1E:BD", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1E:BE", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1F:26", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1F:27", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1F:6C", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1F:9E", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1F:9F", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:1F:CA", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:21:55", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:21:56", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:21:A0", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:21:A1", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:22:0C", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:22:0D", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:22:55", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:22:56", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:22:90", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:22:91", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:22:BD", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:22:BE", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:04", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:05", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:33", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:34", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:5E", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:AC", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:AD", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:EA", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:EB", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:24:13", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:24:14", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:24:50", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:24:97", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:24:98", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:24:C3", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:24:C4", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:25:45", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:25:46", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:25:83", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:25:84", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:25:B4", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:25:B5", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:0A", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:0B", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:52", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:53", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:99", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:CA", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:CB", vendor: "Cisco Systems, Inc.", country: "US", type: "NIC" },
  // Dell
  { prefix: "00:06:5B", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:08:74", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:0B:DB", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:0D:56", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:0F:1F", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:11:43", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:12:3F", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:13:72", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:14:22", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:15:C5", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:18:8B", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:19:B9", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:1A:4B", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:1C:23", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:1D:09", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:1E:4F", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:21:70", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:22:19", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:23:AE", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:24:E8", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:25:64", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "00:26:B9", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "18:03:73", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "18:66:DA", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "24:B6:FD", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "28:F1:0E", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "34:17:EB", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "44:A8:42", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "54:9F:35", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "5C:F9:DD", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "78:2B:CB", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "84:7B:EB", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "90:B1:1C", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "A4:1F:72", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "B0:83:FE", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "B8:AC:6F", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "D4:BE:D9", vendor: "Dell Inc.", country: "US", type: "NIC" },
  { prefix: "F0:4D:A2", vendor: "Dell Inc.", country: "US", type: "NIC" },
  // HP
  { prefix: "00:01:E6", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:01:E7", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:02:A5", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:04:EA", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:08:02", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:0E:7F", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:10:83", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:11:0A", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:12:79", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:13:21", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:14:38", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:14:C2", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:15:60", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:16:35", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:17:08", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:18:FE", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:19:BB", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:1A:4B", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:1B:78", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:1C:C4", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:1D:B3", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:1E:0B", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:1F:29", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:21:5A", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:22:64", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:23:7D", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:24:81", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:25:B3", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "00:26:55", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "3C:D9:2B", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "58:20:B1", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "78:48:59", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "9C:8E:99", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "A0:D3:C1", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  { prefix: "B4:99:BA", vendor: "Hewlett Packard", country: "US", type: "NIC" },
  // Google
  { prefix: "00:1A:11", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "08:9E:08", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "1C:F2:9A", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "20:DF:B9", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "3C:5A:B4", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "48:D6:D5", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "54:60:09", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "6C:AD:F8", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "70:3A:CB", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "94:95:A0", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "A4:77:33", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "D4:F5:47", vendor: "Google, Inc.", country: "US", type: "NIC" },
  { prefix: "F4:F5:D8", vendor: "Google, Inc.", country: "US", type: "NIC" },
  // Microsoft
  { prefix: "00:03:FF", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "00:0D:3A", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "00:12:5A", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "00:15:5D", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "00:17:FA", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "00:50:F2", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "28:18:78", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "30:59:B7", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "48:50:73", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "50:1A:C5", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "54:27:1E", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "60:45:BD", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "70:85:C2", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "7C:1E:52", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "BC:83:85", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "C0:3E:BA", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  { prefix: "D4:01:29", vendor: "Microsoft Corporation", country: "US", type: "NIC" },
  // Huawei
  { prefix: "00:18:82", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "00:1E:10", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "00:22:A1", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "00:25:9E", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "04:02:1F", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "04:C0:6F", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "08:19:A6", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "0C:37:DC", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "10:1B:54", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "14:B9:68", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "1C:8E:5C", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "20:08:ED", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "24:09:95", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "28:31:52", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "2C:AB:00", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "30:D1:7E", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "34:6B:D3", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "38:F8:89", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "3C:8C:93", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "40:4D:8E", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "48:AD:08", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "4C:1F:CC", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "50:68:0A", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "54:89:98", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "58:2A:F7", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "5C:C3:07", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "60:DE:44", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "64:A6:51", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "68:A0:F6", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "6C:8D:C1", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "70:7B:E8", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "74:A7:22", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "78:1D:BA", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "7C:A2:3E", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "80:71:7A", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "84:DB:AC", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "88:E3:AB", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "8C:34:FD", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "90:67:1C", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "94:77:2B", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "98:E7:F5", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "9C:28:EF", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "A0:08:6F", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "AC:E8:7B", vendor: "Huawei Technologies Co., Ltd.", country: "CN", type: "NIC" },
  // TP-Link
  { prefix: "00:1D:0F", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "14:CC:20", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "18:D6:C7", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "1C:3B:F3", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "20:DC:E6", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "24:05:88", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "28:87:BA", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "2C:4D:54", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "30:B5:C2", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "34:60:F9", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "38:94:ED", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "3C:52:82", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "40:16:9F", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "44:94:FC", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "50:3E:AA", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "54:C8:0F", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "5C:89:9A", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "60:E3:27", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "64:70:02", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "6C:72:20", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "74:DA:38", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "78:44:76", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "7C:8B:CA", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "80:35:C1", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "84:16:F9", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "88:DC:96", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "8C:21:0A", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "90:F6:52", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "94:0C:6D", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "98:DA:C4", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "9C:A6:15", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "A0:F3:C1", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "A4:2B:B0", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "AC:84:C9", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "B0:48:7A", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "B4:B0:24", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "C0:4A:00", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "C4:6E:1F", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "D8:07:B6", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "DC:FE:07", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "E0:28:6D", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "EC:08:6B", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "F4:EC:38", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  { prefix: "F8:1A:67", vendor: "TP-Link Technologies Co., Ltd.", country: "CN", type: "NIC" },
  // Netgear
  { prefix: "00:09:5B", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "00:0F:B5", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "00:14:6C", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "00:18:4D", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "00:1B:2F", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "00:1E:2A", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "00:1F:33", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "00:22:3F", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "00:24:B2", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "00:26:F2", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "20:E5:2A", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "2C:B0:5D", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "30:46:9A", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "44:94:FC", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "4C:60:DE", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "6C:B0:CE", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "84:1B:5E", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "A0:21:B7", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "B0:39:56", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "C0:3F:0E", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "C4:3D:C7", vendor: "Netgear", country: "US", type: "NIC" },
  { prefix: "E0:91:F5", vendor: "Netgear", country: "US", type: "NIC" },
  // ASUS
  { prefix: "00:0C:6E", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:0E:A6", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:11:2F", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:13:D4", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:15:F2", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:17:31", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:18:F3", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:1A:92", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:1B:FC", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:1D:60", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:1E:8C", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:1F:C6", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:22:15", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:23:54", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:24:8C", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "00:26:18", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "04:D4:C4", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "08:60:6E", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "10:BF:48", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "14:DA:E9", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "1C:87:2C", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "20:CF:30", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "2C:56:DC", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "30:85:A9", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "38:2C:4A", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "40:16:7E", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "50:46:5D", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "54:04:A6", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "60:45:CB", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "6C:F0:49", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "74:D0:2B", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "7C:2E:BD", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "88:D7:F6", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "90:E6:BA", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "AC:22:0B", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "BC:AE:C5", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "C8:60:00", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "D8:50:E6", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "E4:70:B8", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  { prefix: "F4:6D:04", vendor: "ASUSTek COMPUTER INC.", country: "TW", type: "NIC" },
  // Lenovo
  { prefix: "00:09:2D", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "00:1A:6B", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "00:21:CC", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "00:25:B3", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "04:7D:7B", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "0C:8B:FD", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "10:02:B5", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "18:2A:7B", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "28:D2:44", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "3C:97:0E", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "40:2C:F4", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "48:0F:CF", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "54:EE:75", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "60:02:B4", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "6C:0E:0D", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "70:5A:0F", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "74:27:EA", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "78:92:9C", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "8C:73:6E", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "98:FA:9B", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "A4:C3:F0", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "B4:6B:FC", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "C8:5B:76", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "D4:85:64", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "E0:94:67", vendor: "Lenovo", country: "US", type: "NIC" },
  { prefix: "F0:DE:F1", vendor: "Lenovo", country: "US", type: "NIC" },
  // Amazon
  { prefix: "00:BB:3A", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "0C:47:C9", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "18:74:2E", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "28:EF:01", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "34:D2:70", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "38:F7:3D", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "40:B4:CD", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "44:65:0D", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "50:DC:E7", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "68:37:E9", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "74:75:48", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "78:E1:03", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "84:D6:D0", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "88:71:E5", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "A0:02:DC", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "B4:7C:9C", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "CC:F7:35", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "D0:03:DF", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "F0:27:2D", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  { prefix: "FC:A1:83", vendor: "Amazon Technologies Inc.", country: "US", type: "NIC" },
  // Raspberry Pi Foundation
  { prefix: "B8:27:EB", vendor: "Raspberry Pi Foundation", country: "GB", type: "NIC" },
  { prefix: "DC:A6:32", vendor: "Raspberry Pi Foundation", country: "GB", type: "NIC" },
  { prefix: "E4:5F:01", vendor: "Raspberry Pi Foundation", country: "GB", type: "NIC" },
  { prefix: "28:CD:C1", vendor: "Raspberry Pi Trading Ltd", country: "GB", type: "NIC" },
  { prefix: "D8:3A:DD", vendor: "Raspberry Pi Trading Ltd", country: "GB", type: "NIC" },
  // Broadcom
  { prefix: "00:10:18", vendor: "Broadcom", country: "US", type: "NIC" },
  { prefix: "00:17:F2", vendor: "Broadcom", country: "US", type: "NIC" },
  { prefix: "00:90:4C", vendor: "Broadcom", country: "US", type: "NIC" },
  { prefix: "00:AA:70", vendor: "Broadcom", country: "US", type: "NIC" },
  // Qualcomm
  { prefix: "00:02:6F", vendor: "Qualcomm Atheros", country: "US", type: "NIC" },
  { prefix: "00:03:7F", vendor: "Qualcomm Atheros", country: "US", type: "NIC" },
  { prefix: "00:0B:6B", vendor: "Qualcomm Atheros", country: "US", type: "NIC" },
  { prefix: "00:17:7F", vendor: "Qualcomm Atheros", country: "US", type: "NIC" },
  { prefix: "00:1A:EF", vendor: "Qualcomm Atheros", country: "US", type: "NIC" },
  { prefix: "20:02:AF", vendor: "Qualcomm Atheros", country: "US", type: "NIC" },
  // VMware
  { prefix: "00:0C:29", vendor: "VMware, Inc.", country: "US", type: "Virtual" },
  { prefix: "00:50:56", vendor: "VMware, Inc.", country: "US", type: "Virtual" },
  { prefix: "00:05:69", vendor: "VMware, Inc.", country: "US", type: "Virtual" },
  { prefix: "00:1C:14", vendor: "VMware, Inc.", country: "US", type: "Virtual" },
  // Realtek
  { prefix: "00:01:6C", vendor: "Realtek Semiconductor Corp.", country: "TW", type: "NIC" },
  { prefix: "00:13:46", vendor: "Realtek Semiconductor Corp.", country: "TW", type: "NIC" },
  { prefix: "00:14:78", vendor: "Realtek Semiconductor Corp.", country: "TW", type: "NIC" },
  { prefix: "00:1B:2F", vendor: "Realtek Semiconductor Corp.", country: "TW", type: "NIC" },
  { prefix: "00:22:5C", vendor: "Realtek Semiconductor Corp.", country: "TW", type: "NIC" },
  { prefix: "00:26:18", vendor: "Realtek Semiconductor Corp.", country: "TW", type: "NIC" },
  { prefix: "00:E0:4C", vendor: "Realtek Semiconductor Corp.", country: "TW", type: "NIC" },
  { prefix: "52:54:00", vendor: "Realtek Semiconductor Corp.", country: "TW", type: "Virtual" },
  // D-Link
  { prefix: "00:05:5D", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:0D:88", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:0F:3D", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:11:95", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:13:46", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:15:E9", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:17:9A", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:19:5B", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:1B:11", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:1C:F0", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:1E:58", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:21:91", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:22:B0", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:24:01", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "00:26:5A", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "14:D6:4D", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "1C:7E:E5", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "28:10:7B", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "34:08:04", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "3C:1E:04", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "48:EE:0C", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "5C:D9:98", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "6C:19:8F", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "78:32:1B", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "84:C9:B2", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "90:94:E4", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "A0:AB:1B", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "BC:F6:85", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "C8:BE:19", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "CC:B2:55", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  { prefix: "F0:7D:68", vendor: "D-Link Corporation", country: "TW", type: "NIC" },
  // Xiaomi
  { prefix: "00:EC:0A", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "04:CF:8C", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "0C:1D:AF", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "14:F6:5A", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "18:59:36", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "20:82:C0", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "28:6C:07", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "2C:DB:07", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "34:80:B3", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "38:A4:ED", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "3C:BD:D8", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "40:31:3C", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "50:64:2B", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "58:44:98", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "64:09:80", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "68:DF:DD", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "74:23:44", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "78:11:DC", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "8C:BE:BE", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "98:FA:E3", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "A4:A1:C2", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "AC:F7:F3", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "B0:E2:35", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "C4:6A:B7", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "D4:97:0B", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  { prefix: "F8:A4:5F", vendor: "Xiaomi Communications Co Ltd", country: "CN", type: "NIC" },
  // OnePlus
  { prefix: "04:D6:AA", vendor: "OnePlus Technology (Shenzhen) Co., Ltd", country: "CN", type: "NIC" },
  { prefix: "C4:DB:C7", vendor: "OnePlus Technology (Shenzhen) Co., Ltd", country: "CN", type: "NIC" },
  { prefix: "EC:1F:72", vendor: "OnePlus Technology (Shenzhen) Co., Ltd", country: "CN", type: "NIC" },
  // LG
  { prefix: "00:1C:62", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "00:1E:75", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "00:AA:02", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "10:68:3F", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "20:16:D8", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "34:FC:B9", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "40:55:39", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "50:55:27", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "60:AB:14", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "78:5D:C8", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "9C:2A:70", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "A8:16:D0", vendor: "LG Electronics", country: "KR", type: "NIC" },
  { prefix: "C4:43:8F", vendor: "LG Electronics", country: "KR", type: "NIC" },
  // Motorola
  { prefix: "00:04:62", vendor: "Motorola, Inc.", country: "US", type: "NIC" },
  { prefix: "00:07:2D", vendor: "Motorola, Inc.", country: "US", type: "NIC" },
  { prefix: "00:08:A3", vendor: "Motorola, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0B:A9", vendor: "Motorola, Inc.", country: "US", type: "NIC" },
  { prefix: "00:0C:E5", vendor: "Motorola, Inc.", country: "US", type: "NIC" },
  { prefix: "2C:C5:4E", vendor: "Motorola Mobility LLC, a Lenovo Company", country: "US", type: "NIC" },
  { prefix: "38:17:C3", vendor: "Motorola Mobility LLC, a Lenovo Company", country: "US", type: "NIC" },
  { prefix: "40:B7:F3", vendor: "Motorola Mobility LLC, a Lenovo Company", country: "US", type: "NIC" },
  { prefix: "7C:5C:F8", vendor: "Motorola Mobility LLC, a Lenovo Company", country: "US", type: "NIC" },
  { prefix: "A8:9F:EC", vendor: "Motorola Mobility LLC, a Lenovo Company", country: "US", type: "NIC" },
  { prefix: "BC:AD:28", vendor: "Motorola Mobility LLC, a Lenovo Company", country: "US", type: "NIC" },
  // Nokia
  { prefix: "00:02:EE", vendor: "Nokia Corporation", country: "FI", type: "NIC" },
  { prefix: "00:0D:93", vendor: "Nokia Corporation", country: "FI", type: "NIC" },
  { prefix: "00:1A:DC", vendor: "Nokia Corporation", country: "FI", type: "NIC" },
  { prefix: "00:21:FE", vendor: "Nokia Corporation", country: "FI", type: "NIC" },
  { prefix: "00:23:14", vendor: "Nokia Corporation", country: "FI", type: "NIC" },
  // Sony
  { prefix: "00:01:4A", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "00:04:1F", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "00:0D:4B", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "00:13:A9", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "00:15:C1", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "00:19:C5", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "00:1A:80", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "00:1D:BA", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "00:24:BE", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "00:26:43", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "04:98:F3", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "18:00:2D", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "28:0D:FC", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "30:17:C8", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "40:B8:37", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "54:42:49", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "70:2A:D5", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "84:C7:EA", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "A0:E4:53", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "AC:9B:0A", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "D0:27:88", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "E0:19:1D", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  { prefix: "F4:B7:E2", vendor: "Sony Corporation", country: "JP", type: "NIC" },
  // Ubiquiti
  { prefix: "00:15:6D", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "00:27:22", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "04:18:D6", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "0C:80:63", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "18:E8:29", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "24:A4:3C", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "44:D9:E7", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "60:22:32", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "68:72:51", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "74:83:C2", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "78:8A:20", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "80:2A:A8", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "B4:FB:E4", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "DC:9F:DB", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "E0:63:DA", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "F0:9F:C2", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
  { prefix: "FC:EC:DA", vendor: "Ubiquiti Networks Inc.", country: "US", type: "NIC" },
];

// Build a lookup map for O(1) search
const OUI_MAP = new Map<string, OuiEntry>(
  OUI_DATABASE.map((entry) => [entry.prefix.toUpperCase(), entry])
);

function normalizeMAC(input: string): string | null {
  // Remove all separators
  const stripped = input.replace(/[:\-\.\s]/g, "").toUpperCase();
  // Must be exactly 12 hex chars
  if (!/^[0-9A-F]{12}$/.test(stripped)) return null;
  // Format as XX:XX:XX:XX:XX:XX
  return [0, 2, 4, 6, 8, 10].map((i) => stripped.slice(i, i + 2)).join(":");
}

function extractOUI(normalizedMAC: string): string {
  // First 3 octets as XX:XX:XX
  return normalizedMAC.slice(0, 8).toUpperCase();
}

function lookupOUI(oui: string): OuiEntry | null {
  return OUI_MAP.get(oui) ?? null;
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: "US",
  KR: "KR",
  CN: "CN",
  TW: "TW",
  JP: "JP",
  GB: "GB",
  FI: "FI",
};

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  KR: "South Korea",
  CN: "China",
  TW: "Taiwan",
  JP: "Japan",
  GB: "United Kingdom",
  FI: "Finland",
};

const EXAMPLE_MACS = [
  { label: "Apple MacBook", mac: "00:14:51:AA:BB:CC" },
  { label: "Samsung Galaxy", mac: "00:12:47:11:22:33" },
  { label: "Cisco Router", mac: "00:0D:28:AA:BB:CC" },
  { label: "Raspberry Pi 4", mac: "DC:A6:32:11:22:33" },
  { label: "VMware VM", mac: "00:0C:29:AA:BB:CC" },
];

export default function MacAddressLookup() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    normalizedMAC: string;
    oui: string;
    entry: OuiEntry | null;
  } | null>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleLookup = useCallback((value?: string) => {
    const raw = value ?? input;
    setError("");
    setResult(null);

    if (!raw.trim()) {
      setError("Please enter a MAC address.");
      return;
    }

    const normalized = normalizeMAC(raw.trim());
    if (!normalized) {
      setError(
        "Invalid MAC address format. Accepted formats: AA:BB:CC:DD:EE:FF, AA-BB-CC-DD-EE-FF, AABBCCDDEEFF"
      );
      return;
    }

    const oui = extractOUI(normalized);
    const entry = lookupOUI(oui);
    setResult({ normalizedMAC: normalized, oui, entry });
  }, [input]);

  const handleExampleClick = useCallback((mac: string) => {
    setInput(mac);
    handleLookup(mac);
  }, [handleLookup]);

  const handleCopy = useCallback(async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  return (
    <div className="space-y-6">
      {/* Input card */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <label className="block text-sm font-semibold text-foreground mb-2">
          MAC Address
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
              setResult(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="e.g. AA:BB:CC:DD:EE:FF or AABBCCDDEEFF"
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground font-mono text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            onClick={() => handleLookup()}
            className="px-5 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
          >
            Lookup
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-500">{error}</p>
        )}
        <p className="mt-2 text-xs text-muted">
          Accepts XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX, or XXXXXXXXXXXX format
        </p>
      </div>

      {/* Examples */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_MACS.map(({ label, mac }) => (
            <button
              key={mac}
              onClick={() => handleExampleClick(mac)}
              className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground hover:border-accent hover:text-accent transition-colors font-mono"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
          {/* Vendor found / not found banner */}
          {result.entry ? (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">{result.entry.vendor}</p>
                {result.entry.country && (
                  <p className="text-xs text-green-600 mt-0.5">
                    {COUNTRY_NAMES[result.entry.country] ?? result.entry.country}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-800">Vendor not found</p>
                <p className="text-xs text-yellow-600 mt-0.5">
                  OUI prefix not in bundled database. Try the IEEE registry for a full lookup.
                </p>
              </div>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailRow
              label="Normalized MAC"
              value={result.normalizedMAC}
              onCopy={() => handleCopy("mac", result.normalizedMAC)}
              isCopied={copiedKey === "mac"}
            />
            <DetailRow
              label="OUI Prefix"
              value={result.oui}
              onCopy={() => handleCopy("oui", result.oui)}
              isCopied={copiedKey === "oui"}
            />
            {result.entry && (
              <>
                <DetailRow
                  label="Vendor"
                  value={result.entry.vendor}
                  onCopy={() => handleCopy("vendor", result.entry!.vendor)}
                  isCopied={copiedKey === "vendor"}
                />
                {result.entry.country && (
                  <DetailRow
                    label="Country"
                    value={`${COUNTRY_NAMES[result.entry.country] ?? result.entry.country} (${result.entry.country})`}
                    onCopy={() => handleCopy("country", result.entry!.country!)}
                    isCopied={copiedKey === "country"}
                  />
                )}
                {result.entry.type && (
                  <DetailRow
                    label="Type"
                    value={result.entry.type}
                    onCopy={() => handleCopy("type", result.entry!.type!)}
                    isCopied={copiedKey === "type"}
                  />
                )}
              </>
            )}
          </div>

          {/* MAC structure breakdown */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              MAC Address Structure
            </p>
            <div className="flex flex-wrap gap-1 items-center font-mono text-sm">
              {result.normalizedMAC.split(":").map((octet, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      i < 3
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "bg-border/50 text-muted border border-border"
                    }`}
                  >
                    {octet}
                  </span>
                  {i < 5 && <span className="text-muted text-xs">:</span>}
                </span>
              ))}
              <span className="ml-2 text-xs text-muted flex gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                  OUI (vendor)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-border border border-border inline-block" />
                  NIC specific
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">About OUI Lookup</h3>
        <p className="text-xs text-muted leading-relaxed">
          The first 3 octets (24 bits) of a MAC address form the OUI (Organizationally Unique
          Identifier), assigned by IEEE to manufacturers. This tool bundles the most common OUI
          prefixes for instant offline lookup. For the full IEEE registry, visit{" "}
          <a
            href="https://regauth.standards.ieee.org/standards-ra-web/pub/view.html#registries"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2"
          >
            IEEE Registration Authority
          </a>
          .
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center min-h-[90px]">
        <span className="text-xs text-muted">Advertisement</span>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  onCopy,
  isCopied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  isCopied: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-background rounded-xl px-3 py-2.5 border border-border">
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="font-mono text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="ml-2 p-1.5 text-muted hover:text-foreground transition-colors shrink-0"
        title={`Copy ${label}`}
      >
        {isCopied ? (
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
          </svg>
        )}
      </button>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this MAC Address OUI Lookup tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Look up the manufacturer/vendor of a MAC address from the OUI prefix. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this MAC Address OUI Lookup tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Look up the manufacturer/vendor of a MAC address from the OUI prefix. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MAC Address OUI Lookup",
  "description": "Look up the manufacturer/vendor of a MAC address from the OUI prefix",
  "url": "https://tools.loresync.dev/mac-address-lookup",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
