/**
 * configファイルの読み込み
 */
const config = require('./forward-wp-posts-config.json');


/**
 * メインの処理
 */
(async () => {
    // 引数の処理
    const arg = [];
    if (process.argv[2]) { arg.push(process.argv[2]) }
    if (process.argv[3]) { arg.push(process.argv[3]) }

    const from = arg.indexOf('--pull') >= 0 ? 'remote' : 'local';
    const to   = arg.indexOf('--pull') >= 0 ? 'local'  : 'remote';
    
    // [LOG] START
    console.clear();
    require('readline').cursorTo(process.stdout, 0, 0);
    process.stdout.write('\x1b[46m\x1b[1m\x1b[30m Forward Wordpress Posts \x1b[0m by udcxx.\x1b[K');

    // [LOG] 記事取得開始
    require('readline').cursorTo(process.stdout, 3, 3);
    process.stdout.write('記事データを取得しています...\x1b[K');

    // 取得
    const getHeader = {};
    if (config[from].isBasic) {
        getHeader['Authorization'] = 'Basic ' + Buffer.from(`${config[from].basic.user}:${config[from].basic.password}`).toString('base64')
    }

    const get = await fetch(
        config[from].URL + 'wp-json/wp/v2/posts?_fields=slug,status,type,title,excerpt,content,id&per_page=100', 
        {
            'method':'GET',
            'headers': getHeader
        }
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

    if (arg.indexOf('--force-create') >= 0) {
        // すべて新規追加
        for (let count = 0; count < data.length; count++) {
            const post = data[count]
            
            const postData = {
                "title": post.title.rendered,
                "content": post.content.rendered,
                "excerpt": post.excerpt.rendered,
                "slug": post.slug,
                "status": post.status,
                "type": post.type
            }
    
            await sendPost(config[to].URL, postHead, postData, count, data.length);
        }

    } else {
        // 記事があれば更新
        const postCheckHeader = {};
        if (config[to].isBasic) {
            postCheckHeader['Authorization'] = 'Basic ' + Buffer.from(`${config[to].basic.user}:${config[to].basic.password}`).toString('base64')
        }
    
        const postCheck = await fetch(
            config[to].URL + 'wp-json/wp/v2/posts?_fields=slug,id', 
            {
                'method':'GET',
                'headers': postCheckHeader
            }
        );
        const currentData = await postCheck.json();

        const currentFormatedData = {};
        currentData.forEach((d) => {
            currentFormatedData[d.slug] = d.id
        })

        for (let count = 0; count < data.length; count++) {
            const post = data[count]
            
            const postData = {
                "title": post.title.rendered,
                "content": post.content.rendered,
                "excerpt": post.excerpt.rendered,
                "slug": post.slug,
                "status": post.status,
                "type": post.type
            }
    
            if (currentFormatedData[post.slug]) {
                // 記事がすでに存在する
                await sendPost(config[to].URL, postHead, postData, count, data.length, currentFormatedData[post.slug]);

            } else {
                // 記事が存在しない
                await sendPost(config[to].URL, postHead, postData, count, data.length);
            }
        }
    }
    // [LOG] 全終了
    require('readline').cursorTo(process.stdout, 3, 3);
    process.stdout.write('完了しました！\x1b[K');
    require('readline').cursorTo(process.stdout, 5, 4);
    process.stdout.write('\x1b[K');
    require('readline').cursorTo(process.stdout, 0, 6);
})();


/**
 * 個別記事投稿を送信します（新規・更新）
 * 
 * @param {String} postUrl 投稿先のURL
 * @param {Object} postHead 投稿時に使用するヘッダー情報
 * @param {Object} postData 投稿内容
 * @param {Number} index 投稿する記事のインデックス
 * @param {Number} postLength 処理する投稿の総数
 * @param {Number} id 更新する記事の記事ID（新規の場合0を指定）
 */
async function sendPost(postUrl, postHead, postData, index, postLength, id = 0) {
    const url = id === 0 ? postUrl + 'wp-json/wp/v2/posts' : postUrl + 'wp-json/wp/v2/posts/' + id;
    const method = id === 0 ? 'POST' : 'PUT';
    try {
        await fetch(
            url,
            {
                'method': method,
                'headers': postHead,
                'body': JSON.stringify(postData)
            }
        )

        // [LOG] 投稿成功
        require('readline').cursorTo(process.stdout, 5, 4);
        process.stdout.write(`[${index + 1}/${postLength}] ${postData.title}\x1b[K`);

        return true;
    } catch (error) {
        // [LOG] エラー
        require('readline').cursorTo(process.stdout, 7, 0);
        process.stdout.write(`Error: ${error}\x1b[K`);
        throw new Error(`投稿に失敗しました：${postData.title}`);
    };
}