import React, {useEffect, useRef, useState} from 'react';
import Tree from 'react-d3-tree';
import {Post, PostNode} from '../lib/post';
import {YoutubeTranscript} from 'youtube-transcript';
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
    const treeContainer = useRef(null);

    useEffect(() => {
        if (treeContainer.current) {
            const dimensions = treeContainer.current.getBoundingClientRect();
            setTranslate({x: dimensions.width / 4, y: dimensions.height / 2});
        }
    }, [treeContainer]);

    const separation = {
        siblings: 3,
        nonSiblings: 3,
    };

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
        console.log(url)
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

    async function onSubmit(e) {
        e.preventDefault();
        // if (!question || !identity1) return;
        setIsLoading(true);
        try {
            const youtubeId = extractVideoId(youtubeUrl)
            const ttf = await PostNode("/api/youtube-caption", {text: youtubeId});
            if (ttf.length >= 500) {
                throw new Error('申し訳ありませんが、動画内の字幕の文章が長過ぎます。')
            }
            let i = 0;
            let res: any = {};
            let newData: any = {};
            while (i < ttf.length) {
                const text = ttf.slice(i, i + 100).map(item => item.text).join('\n');
                if (!Object.keys(newData).length) {
                    const template = `上記の型式で、「${text}」の内容を整理して出力してください。ただし、JSON.parseでjsonに変換できる文字列として出力して下さい。`
                    res = await PostNode("/api/generate", {text: template});
                } else {
                    const template = `前回までの出力結果はこちらです。
                            「${JSON.stringify(newData)}」 
                            指定の形式で、
                            「${text}}」
                            の内容を整理して、前回までの出力結果を修正する形で出力してください。ただし、JSON.parseでjsonに変換できる文字列として出力して下さい。`
                    res = await PostNode("/api/generate", {text: template});
                }
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
                    <input type="text" className="form-control mb-4" name="question"
                           placeholder="ここにYouTubeのURLを入れてください"
                           value={youtubeUrl} onChange={(e) => setQuestion(e.target.value)}/>
                </div>
                <div>
                    {!isLoading ?
                        <div className="flex justify-center mt-">
                            <button type="submit"
                                    className="w-24 bg-main bg-main-hover text-white text-lg font-bold py-1 rounded transition"
                                    disabled={extractVideoId(youtubeUrl)===""}>Generate
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
                    zoom={0.5}
                    initialDepth={2}
                    zoomable={true}
                    draggable={true}
                    nodeSize={{x: 800, y: 100}}
                    // onNodeClick={handleNodeClick}
                    // onLinkClick={handleNodeClick}
                />
            </div>
        </>
    );
}
// zoom プロパティは、ツリーの表示倍率を制御し、initialDepth プロパティは、初期表示時に展開されるツリーの深さを制御します。
// siblings と nonSiblings の間隔を1.2に設定しています。これにより、ツリーの上下の間隔が広がり、上半分が隠れなくなります。また、translate の y 値を dimensions.height / 10 に変更して、上部に十分なスペースが確保されるように調整しました。