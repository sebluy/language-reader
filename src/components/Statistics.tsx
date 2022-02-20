import * as React from 'react'

export class Statistics extends React.Component<any, any> {

    render() {
        let fp = (p) => (p * 100).toFixed(2) + '%'
        let p = this.props
        return (
            <div className="sidebar-group">
                <table id="stats">
                    <tbody>
                        <tr><td>Total Words Translated</td><td>{p.totalWordsTranslated}</td></tr>
                        <tr><td>New Words</td><td>{p.newWords}</td></tr>
                        <tr><td>Words Learned Today</td><td>{p.wordsLearnedToday}</td></tr>
                        <tr><td>Percent Translated</td><td>{fp(p.percentTranslated)}</td></tr>
                        <tr><td>Words Mastered</td><td>{fp(p.percentWordsMastered)}</td></tr>
                        <tr><td>Today's XP</td><td>{p.xpToday}</td></tr>
                        <tr><td>Last XP</td><td>{p.xpLast}</td></tr>
                    </tbody>
                </table>
                <button onClick={p.update}>Update Stats</button>
            </div>
        )
    }

}