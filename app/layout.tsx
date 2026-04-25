import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import { AppProviders } from "@/app/providers";

export const metadata: Metadata = {
  title: "AI舆情分析与投诉预警",
  description: "实时抓取社区论坛、社交媒体及政府投诉平台信息，利用自然语言处理技术进行情感分析和舆情分类。当出现负面舆情苗头时，系统自动预警并建议采取相应措施。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <AppProviders>{children}</AppProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
