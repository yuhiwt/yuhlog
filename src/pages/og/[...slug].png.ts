import satori from 'satori';
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

// ■ フォント取得関数
function getFontData() {
  // public/fonts/NotoSerifJP-Bold.ttf を読み込む
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSerifJP-Bold.ttf');
  return fs.readFileSync(fontPath);
}

export async function getStaticPaths() {
  const posts = import.meta.glob('../posts/*.md');
  const paths = [];
  for (const path in posts) {
    const slug = 'posts/' + path.split('/').pop()?.replace('.md', '');
    const post: any = await posts[path]();
    paths.push({ params: { slug }, props: { title: post.frontmatter.title } });
  }
  return paths;
}

export async function GET({ props: { title } }) {
  const fontData = getFontData();

  // 1. SVG生成 (Satori)
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          height: '100%',
          width: '100%',
          backgroundColor: '#faf9f6',
          // padding: '80px', // 全体のパディングは削除し、個別に配置します
          position: 'relative', // 相対配置を有効化
        },
        children: [
          // 1. 記事タイトル（中央配置）
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px', // テキストの余白
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '64px',
                      fontWeight: 700,
                      fontFamily: '"Noto Serif JP"',
                      color: '#262626',
                      textAlign: 'center',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    },
                    children: title,
                  },
                },
              ],
            },
          },
          // 2. サイトロゴ（右下配置）
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '50px', // 下からの距離
                right: '60px',  // 右からの距離
                fontSize: '24px',
                fontFamily: '"Noto Serif JP"',
                fontWeight: 700, // サイトヘッダーに合わせて太くする
                color: '#a3a3a3', // 少し薄くして上品に
                letterSpacing: '0.05em',
              },
              children: 'yuhlog',
            },
          }
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Serif JP',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  );

  // 2. PNG変換 (Resvg)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const image = resvg.render();

  // 3. PNG画像を返す
  return new Response(image.asPng(), {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}