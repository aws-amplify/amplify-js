import Link from 'next/link';

const Home = () => {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '1rem',
				padding: '1rem',
			}}
		>
			<h1>AWS AMPLIFY</h1>

			<nav style={{ display: 'flex', gap: '1rem' }}>
				<Link href="/signin">
					<a>signIn Auth</a>
				</Link>
				<Link href="/signinMachine">
					<a>signIn Auth Machine</a>
				</Link>
			</nav>
		</div>
	);
};

export default Home;
