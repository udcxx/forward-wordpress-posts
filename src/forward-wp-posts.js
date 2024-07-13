/**
 * configファイルの読み込み
 */
const config = require('./forward-wp-posts-config.json');


/**
 * メインの処理
 */
(async () => {
    const local2remte = process.argv[2] === 'pull' ? false : true;
    const from = local2remte ? 'local' : 'remote';
    const to = local2remte ? 'remote' : 'local';
    
    // [LOG] START
    console.clear();
    require('readline').cursorTo(process.stdout, 0, 0);
    process.stdout.write('\x1b[46m\x1b[1m\x1b[30m Forward Wordpress Posts \x1b[0m by udcxx.\x1b[K');

    // [LOG] 記事取得開始
    require('readline').cursorTo(process.stdout, 3, 3);
    process.stdout.write('記事データを取得しています...\x1b[K');

    // 取得
    const get = await fetch(
        config[from].URL + 'wp-json/wp/v2/posts?_fields=slug,status,type,title,excerpt,content', 
        {'method':'GET'}
    );
    const data = await get.json();


    // [LOG] トークン取得開始
    require('readline').cursorTo(process.stdout, 3, 3);
    process.stdout.write('投稿用の認証トークンを取得しています...\x1b[K');

    // 投稿用のトークン生成
    const tokenHead = {
        "Content-Type": "application/x-www-form-urlencoded"
    };
    if (config[to].isBasic) {
        tokenHead['Authorization'] = 'Basic ' + Buffer.from(`${config[to].basic.user}:${config[to].basic.password}`).toString('base64')
    }

    const tokenFetch = await fetch(
        config[to].URL + 'wp-json/jwt-auth/v1/token',
        {
            'method': 'POST',
            'headers': tokenHead,
            'body': `username=${config[to].user}&password=${config[to].password}`
        }
    )
    const tokenJson =  await tokenFetch.json();
    const token = tokenJson.token;


    // [LOG] 投稿開始
    require('readline').cursorTo(process.stdout, 3, 3);
    process.stdout.write('記事を投稿しています...\x1b[K');

    // 投稿
    const postHead = {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    }
    if (config[to].isBasic) {
        postHead['Authorization'] = 'Basic ' + Buffer.from(`${config[to].basic.user}:${config[to].basic.password}`).toString('base64')
        postHead['X-Authorization'] = 'Bearer ' + token;
    };

    let count = 0;

    data.forEach(async (post, index) => {
        const postData = {
            "title": post.title.rendered,
            "content": post.content.rendered,
            "excerpt": post.excerpt.rendered,
            "slug": post.slug,
            "status": post.status,
            "type": post.type
        }

        try {
            const t = await fetch(
                config[to].URL + 'wp-json/wp/v2/posts',
                {
                    'method': 'POST',
                    'headers': postHead,
                    'body': JSON.stringify(postData)
                }
            )
        } catch (error) {
            // [LOG] エラー
            require('readline').cursorTo(process.stdout, 7, 0);
            process.stdout.write(`Error: ${error}\x1b[K`);
        };

        // [LOG] 投稿成功
        require('readline').cursorTo(process.stdout, 5, 4);
        process.stdout.write(`[${index}/${data.length}] ${post.title.rendered}\x1b[K`);

        count++;
        if (data.length === count) {
            // [LOG] 全終了
            require('readline').cursorTo(process.stdout, 3, 3);
            process.stdout.write('完了しました！\x1b[K');
            require('readline').cursorTo(process.stdout, 5, 4);
            process.stdout.write('\x1b[K');
            require('readline').cursorTo(process.stdout, 6, 0);
        }
    });
})();

