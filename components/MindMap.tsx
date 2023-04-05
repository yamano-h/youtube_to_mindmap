import React, {useEffect, useRef, useState} from 'react';
import Tree from 'react-d3-tree';
import {Post, PostNode} from '../lib/post';
import {getSubtitles} from 'youtube-captions-scraper';


const addChildToNode = (node, newNodeName) => {
    if (!node.children) {
        node.children = [];
    }

    node.children.push({
        name: newNodeName,
        children: [],
    });
};


export default function OrgChartTree() {
    const [translate, setTranslate] = useState({x: 0, y: 0});
    const [dragging, setDragging] = useState(false);
    const [lastMousePosition, setLastMousePosition] = useState(null);
    const [treeData, setTreeData] = useState([{name: "Press the button above!"}]);
    // const [treeData, setTreeData] = useState([{
    //     "name": "1. リーダーシップ革命の要点",
    //     "children": [
    //         {
    //             "name": "1-1. リーダーシップは才能で決まらない",
    //             "children": [
    //                 {
    //                     "name": "1-1-1. 自己保存を書き換えることがリーダーシップ能力を身につける秘訣",
    //                     "children": [
    //                         {
    //                             "name": "リーダーシップ能力は誰でも身につけることができる"
    //                         },
    //                         {
    //                             "name": "自己保存に反する行動をすることがリーダーシップ"
    //                         },
    //                         {
    //                             "name": "マイナスからプラスに脳内改変してリーダーシップを獲得"
    //                         },
    //                         {
    //                             "name": "成功体験を積むことで定着させることができる"
    //                         }
    //                     ]
    //                 }
    //             ]
    //         },
    //         {
    //             "name": "1-2. 原動力は「欲」",
    //             "children": [
    //                 {
    //                     "name": "1-2-1. よくを明確にする",
    //                     "children": [
    //                         {
    //                             "name": "リーダーシップ能力を身につけるためには、「よく」を探すことが必要"
    //                         },
    //                         {
    //                             "name": "3 wantsモデル",
    //                             "children": [
    //                                 {
    //                                     "name": "People want: 人が欲すること"
    //                                 },
    //                                 {
    //                                     "name": "Top people: ここでの人々の奮闘が不可欠"
    //                                 },
    //                                 {
    //                                     "name": "I want: 己が欲すること"
    //                                 }
    //                             ]
    //                         },
    //                         {
    //                             "name": "リーダーシップを発揮できる領域=3つのウォンツが重なる対象"
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     "name": "1-2-2. 欲の強さが人を動かすエネルギーになる"
    //                 }
    //             ]
    //         },
    //         {
    //             "name": "1-3. 3つの翼を探すぞ",
    //             "children": [
    //                 {
    //                     "name": "自分が心からやりたいことが、リーダーシップを発揮できる領域"
    //                 },
    //                 {
    //                     "name": "自分の欲を明確にすることがリーダーシップ能力を身に付ける大前提"
    //                 },
    //                 {
    //                     "name": "3つのウォンツが重なる対象を見つけることが求められる"
    //                 }
    //             ]
    //         },
    //         {
    //             "name": "1-4. 相手を受け入れること",
    //             "children": [
    //                 {
    //                     "name": "仲間はプロジェクトを成功させるために必要不可欠"
    //                 },
    //                 {
    //                     "name": "仲間に本気にさせることが成功の鍵となる"
    //                 },
    //                 {
    //                     "name": "相手を受け入れられる度量を手に入れましょう",
    //                     "children": [
    //                         {
    //                             "name": "音毛の部分とは盛岡市がつくった言葉でその人が根源的に持っている強みのことを指す"
    //                         },
    //                         {
    //                             "name": "強みだけでなく弱みや短所といった部分も全て受け入れられるかどうかが仲間を本気にさせるキモなのです"
    //                         },
    //                         {
    //                             "name": "共依存関係の構築が重要であること",
    //                             "children": [
    //                                 {
    //                                     "name": "共依存関係とは同じ目的をそれぞれが自発的に追求する関係性であること"
    //                                 },
    //                                 {
    //                                     "name": "お互いの強みを尊重した共存関係であることという2つの条件を満たしたもの"
    //                                 },
    //                                 {
    //                                     "name": "意見の衝突はつきものであること"
    //                                 },
    //                                 {
    //                                     "name": "衝突もするが同じ目的がありお互い尊重できる相手であれば大きなことも成し遂げられる"
    //                                 },
    //                                 {
    //                                     "name": "相手の興味対象を考え相手になりきることで共依存関係がモテること"
    //                                 }
    //                             ]
    //                         }
    //                     ]
    //                 }
    //             ]
    //         }
    //     ]
    // }]);
    const treeContainer = useRef(null);

    useEffect(() => {
        if (treeContainer.current) {
            const dimensions = treeContainer.current.getBoundingClientRect();
            setTranslate({x: dimensions.width / 20, y: dimensions.height / 2});
        }
    }, [treeContainer]);

    const separation = {
        siblings: 10,
        nonSiblings: 10,
    };

    const nodeSize = {x: 800, y: 15}

    const handleMouseDown = (e) => {
        setDragging(true);
        setLastMousePosition({x: e.clientX, y: e.clientY});
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    const handleMouseMove = (e) => {
        if (dragging) {
            const dx = e.clientX - lastMousePosition.x;
            const dy = e.clientY - lastMousePosition.y;

            setTranslate((prevTranslate) => ({
                x: prevTranslate.x + dx,
                y: prevTranslate.y + dy,
            }));

            setLastMousePosition({x: e.clientX, y: e.clientY});
        }
    };

    const handleNodeClick = (node) => {
        const newNodeName = prompt("Enter the name for the new child node:");
        if (newNodeName) {
            const updatedTreeData = JSON.parse(JSON.stringify(treeData));
            console.log(updatedTreeData);
            console.log(node);
            addChildToNode(node, newNodeName);
            setTreeData(updatedTreeData);
        }
    };

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [result, setResult] = useState<string>('');
    const [youtubeUrl, setQuestion] = useState<string>("");
    const [openAIKey, setOpenAIKey] = useState<string>("");

    function parseJSON(obj) {
        try {
            // console.log(obj)
            // 最初と最後の文字が同じ「'」または「"」であれば削除する
            const firstChar = obj.charAt(0);
            const lastChar = obj.charAt(obj.length - 1);
            if ((firstChar === "'" && lastChar === "'") || (firstChar === '"' && lastChar === '"')) {
                obj = obj.slice(1, -1);
            }
            const replacedString = obj.replace(/`/g, "");

            // 最初の「{」の前の文字列を削除する
            const braceIndex = replacedString.indexOf("{");
            const formattedString = replacedString.slice(braceIndex);

            // 変換後のJSONを作成
            const formattedJson = JSON.parse(formattedString);
            console.log(obj)
            console.log(formattedJson)
            // obj = JSON.parse(obj);
            return formattedJson;
        } catch (e) {
            console.log('error : ', e)
            return null;
        }
    }

    function extractVideoId(url) {
        let videoId = '';

        const pattern = /[?&]v=([a-zA-Z0-9_-]{11})/;
        const match = url.match(pattern);

        if (match) {
            videoId = match[1];
        } else {
            videoId = url.slice(-11);
        }

        return videoId;
    }

    function removeTextInBrackets(text) {
        const regex = /\[[^\]]*\]/g;
        return text.replace(regex, '');
    }


    async function onSubmit(e) {
        e.preventDefault();
        // if (!question || !identity1) return;
        setIsLoading(true);
        try {
            const youtubeId = extractVideoId(youtubeUrl)
            const ttf = await PostNode("/api/youtube-caption", {text: youtubeId});
            if (ttf.length >= 700) {
                console.log(ttf.length)
                throw new Error('申し訳ありませんが、動画内の字幕の文章が長過ぎます。')
            }
            let i = 0;
            let res: any = {};
            let newData: any = {};
            while (i < ttf.length) {
                let text = ttf.slice(i, i + 50).map(item => item.text).join('\n');
                text = removeTextInBrackets(text);
                if (!Object.keys(newData).length) {
                    const template = `上記の型式で、「${text}」内の重要なキーワードをとりこぼさずに完結に整理して出力してください。ただし、JSON.parseでjsonに変換できる文字列として出力して下さい。`
                    res = await PostNode("/api/generate", {text: template, apiKey: openAIKey});
                } else {
                    const template = `前回までの出力結果はこちらです。
                            「${JSON.stringify(newData)}」 
                            指定の形式で、
                            「${text}}」
                            内の重要なキーワードをとりこぼさずに完結に整理して、前回までの出力結果を修正する形で出力してください。ただし、JSON.parseでjsonに変換できる文字列として出力して下さい。`
                    res = await PostNode("/api/generate", {text: template, apiKey: openAIKey});
                }
                console.log(res.content)
                newData = parseJSON(res.content);
                i += 100;
            }

            // console.log('newDAta : ', newData)
            setResult(String(res.content));
            // console.log(String(res.content))
            if (newData) {
                setTreeData(newData);
                setIsReady(true)
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
        setIsLoading(false);
    }

    return (
        <>
            <form onSubmit={onSubmit}>
                <div className='px-2 md:px-4 my-5'>
                    <input type="text" className="form-control mb-4" name="openai-api-key"
                           placeholder="ここにOpenAIのAPIキーを入れてください"
                           value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)}/>
                </div>
                <div className='px-2 md:px-4 my-5'>
                    <input type="text" className="form-control mb-4" name="question"
                           placeholder="ここにYouTubeのURLを入れてください"
                           value={youtubeUrl} onChange={(e) => setQuestion(e.target.value)}/>
                </div>
                <div>
                    {!isLoading ?
                        <div className="flex justify-center mt-">
                            <button type="submit"
                                    className="w-24 bg-main bg-main-hover text-white text-lg font-bold py-1 rounded transition"
                                    disabled={extractVideoId(youtubeUrl) === "" || openAIKey === ""}>Generate
                            </button>
                        </div>
                        :
                        <div className="mt-">
                            <div className="loader text-main"></div>
                        </div>
                    }
                </div>
            </form>
            {/* <div className='my-8'>{result}</div> */}
            <div
                ref={treeContainer}
                className='w-full h-screen'
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <Tree
                    data={treeData}
                    // data={data3}
                    translate={translate}
                    separation={separation}
                    zoom={0.7}
                    initialDepth={5}
                    zoomable={true}
                    draggable={true}
                    nodeSize={nodeSize}
                    // onNodeClick={handleNodeClick}
                    // onLinkClick={handleNodeClick}
                />
            </div>
        </>
    );
}
// zoom プロパティは、ツリーの表示倍率を制御し、initialDepth プロパティは、初期表示時に展開されるツリーの深さを制御します。
// siblings と nonSiblings の間隔を1.2に設定しています。これにより、ツリーの上下の間隔が広がり、上半分が隠れなくなります。また、translate の y 値を dimensions.height / 10 に変更して、上部に十分なスペースが確保されるように調整しました。