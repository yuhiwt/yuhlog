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
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: '#faf9f6',
          padding: '80px',
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
          {
            type: 'div',
            props: {
              style: {
                fontSize: '28px',
                marginTop: '50px',
                fontFamily: '"Noto Serif JP"',
                color: '#a3a3a3',
                letterSpacing: '0.1em',
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