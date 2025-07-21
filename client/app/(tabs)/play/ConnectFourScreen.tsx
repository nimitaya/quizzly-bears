import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Gaps, FontSizes, FontWeights } from '@/styles/theme';
import { Fonts } from '@/styles/fonts';
import IconArrowBack from '@/assets/icons/IconArrowBack';
import IconVolume from '@/assets/icons/IconVolume';
import IconVolumeOff from '@/assets/icons/IconVolumeOff';
import IconHelp from '@/assets/icons/IconHelp';
import Svg, { Circle, Rect, G } from 'react-native-svg';
import { Audio } from 'expo-av';

const ROWS = 6;
const COLS = 7;
const { width: screenWidth } = Dimensions.get('window');
const boardWidth = Math.min(screenWidth - 64, 350);
const cellSize = boardWidth / COLS;
const dividerWidth = 2;
const totalDividerWidth = (COLS - 1) * dividerWidth;
const buttonWidth = (boardWidth - totalDividerWidth) / COLS;

const ConnectFourScreen = () => {
  const router = useRouter();
  const [board, setBoard] = useState<Array<Array<string | null>>>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'yellow'>('red');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [sounds, setSounds] = useState<{[key: string]: Audio.Sound | null}>({});

  useEffect(() => {
    initializeBoard();
    loadSounds();
  }, []);

  // Separate cleanup effect for sounds
  useEffect(() => {
    return () => {
      // Cleanup sounds
      Object.values(sounds).forEach(sound => {
        if (sound) {
          sound.stopAsync().catch(() => {});
          sound.unloadAsync().catch(() => {});
        }
      });
    };
  }, [sounds]);

  const loadSounds = async () => {
    try {
      // Initialize audio mode for mobile devices
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load sounds from the Sounds directory
      const { sound: circleSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/circle.mp3')
      );
      const { sound: crossSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/cross.mp3')
      );
      const { sound: winSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/you-won.mp3')
      );
      const { sound: loseSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/you-loose.mp3')
      );

      setSounds({
        circle: circleSound,
        cross: crossSound,
        win: winSound,
        lose: loseSound,
      });
    } catch (error) {
      console.log('Error loading sounds:', error);
      // Set empty sounds object to prevent further errors
      setSounds({
        circle: null,
        cross: null,
        win: null,
        lose: null,
      });
    }
  };

  const playSound = async (type: string) => {
    if (!soundOn || !sounds[type]) return;
    
    try {
      const sound = sounds[type];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(0.5);
        await sound.playAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const initializeBoard = () => {
    const newBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    setBoard(newBoard);
    setCurrentPlayer('red');
    setGameOver(false);
    setWinner(null);
  };

  const dropDisc = (col: number, currentBoard: Array<Array<string | null>> = board): number | null => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!currentBoard[row][col]) {
        return row;
      }
    }
    return null;
  };

  const checkWin = (row: number, col: number, player: string, currentBoard: Array<Array<string | null>> = board): boolean => {
    const directions = [
      { r: 0, c: 1 },  // Horizontal
      { r: 1, c: 0 },  // Vertikal
      { r: 1, c: 1 },  // Diagonal rechts unten
      { r: 1, c: -1 }  // Diagonal links unten
    ];

    for (let { r, c } of directions) {
      let count = 1;
      count += countDirection(row, col, r, c, player, currentBoard);
      count += countDirection(row, col, -r, -c, player, currentBoard);

      if (count >= 4) {
        return true;
      }
    }

    return false;
  };

  const countDirection = (row: number, col: number, rowInc: number, colInc: number, player: string, currentBoard: Array<Array<string | null>> = board): number => {
    let count = 0;

    for (let i = 1; i < 4; i++) {
      const newRow = row + rowInc * i;
      const newCol = col + colInc * i;

      if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && currentBoard[newRow][newCol] === player) {
        count++;
      } else {
        break;
      }
    }

    return count;
  };

  const findBestMove = (currentBoard: Array<Array<string | null>> = board): number => {
    // 1. Gewinnzug setzen, wenn möglich
    for (let col = 0; col < COLS; col++) {
      const row = dropDisc(col, currentBoard);
      if (row !== null) {
        const tempBoard = currentBoard.map(row => [...row]);
        tempBoard[row][col] = 'yellow';
        if (checkWin(row, col, 'yellow', tempBoard)) {
          return col; // Gewinnzug
        }
      }
    }

    // 2. Verhindern, dass Spieler gewinnt (horizontal, vertikal)
    for (let col = 0; col < COLS; col++) {
      const row = dropDisc(col, currentBoard);
      if (row !== null) {
        const tempBoard = currentBoard.map(row => [...row]);
        tempBoard[row][col] = 'red';
        if (checkWin(row, col, 'red', tempBoard)) {
          return col; // Blockiere Sieg
        }
      }
    }

    // 3. Blockiere vertikale Bedrohungen (drei übereinander)
    for (let col = 0; col < COLS; col++) {
      for (let row = 2; row < ROWS; row++) {
        if (
          currentBoard[row][col] === "red" &&
          row - 1 >= 0 && currentBoard[row - 1][col] === "red" &&
          row - 2 >= 0 && currentBoard[row - 2][col] === "red" &&
          row - 3 >= 0 && currentBoard[row - 3][col] === null
        ) {
          return col; // Setze den Stein direkt über die drei roten Steine
        }
      }
    }

    // 4. Blockiere horizontale Bedrohungen (zwei nebeneinander)
    for (let row = ROWS - 1; row >= 0; row--) {
      for (let col = 0; col < COLS - 2; col++) {
        if (
          currentBoard[row][col] === "red" &&
          currentBoard[row][col + 1] === "red"
        ) {
          // Blockiere rechts
          if (col + 2 < COLS && currentBoard[row][col + 2] === null && dropDisc(col + 2, currentBoard) === row) {
            return col + 2;
          }
          // Blockiere links
          if (col - 1 >= 0 && currentBoard[row][col - 1] === null && dropDisc(col - 1, currentBoard) === row) {
            return col - 1;
          }
        }
      }
    }

    // 5. Blockiere diagonale Bedrohungen (drei in einer Diagonale)
    // Diagonal rechts unten (/)
    for (let row = 3; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (
          currentBoard[row][col] === "red" &&
          row - 1 >= 0 && col + 1 < COLS && currentBoard[row - 1][col + 1] === "red" &&
          row - 2 >= 0 && col + 2 < COLS && currentBoard[row - 2][col + 2] === "red"
        ) {
          // Prüfe Feld oben rechts
          if (row - 3 >= 0 && col + 3 < COLS && currentBoard[row - 3][col + 3] === null && (row - 3 === ROWS - 1 || currentBoard[row - 2][col + 3] !== null)) {
            return col + 3;
          }
          // Prüfe Feld unten links
          if (row + 1 < ROWS && col - 1 >= 0 && currentBoard[row + 1][col - 1] === null && (row + 1 === ROWS - 1 || currentBoard[row][col - 1] !== null)) {
            return col - 1;
          }
        }
      }
    }
    // Diagonal links unten (\)
    for (let row = 3; row < ROWS; row++) {
      for (let col = 3; col < COLS; col++) {
        if (
          currentBoard[row][col] === "red" &&
          row - 1 >= 0 && col - 1 >= 0 && currentBoard[row - 1][col - 1] === "red" &&
          row - 2 >= 0 && col - 2 >= 0 && currentBoard[row - 2][col - 2] === "red"
        ) {
          // Prüfe Feld oben links
          if (row - 3 >= 0 && col - 3 >= 0 && currentBoard[row - 3][col - 3] === null && (row - 3 === ROWS - 1 || currentBoard[row - 2][col - 3] !== null)) {
            return col - 3;
          }
          // Prüfe Feld unten rechts
          if (row + 1 < ROWS && col + 1 < COLS && currentBoard[row + 1][col + 1] === null && (row + 1 === ROWS - 1 || currentBoard[row][col + 1] !== null)) {
            return col + 1;
          }
        }
      }
    }

    // 6. Verhindere, dass der Spieler direkt über einem Kreuz einen Vierer machen kann
    let safeCols = [];
    for (let col = 0; col < COLS; col++) {
      let row = dropDisc(col, currentBoard);
      if (row !== null) {
        // Simuliere Computerzug
        const tempBoard = currentBoard.map(row => [...row]);
        tempBoard[row][col] = "yellow";
        // Prüfe, ob Spieler im nächsten Zug direkt darüber gewinnen kann
        let nextRow = row - 1;
        let isSafe = true;
        if (nextRow >= 0) {
          tempBoard[nextRow][col] = "red";
          if (checkWin(nextRow, col, "red", tempBoard)) {
            isSafe = false;
          }
        }
        if (isSafe) {
          safeCols.push(col);
        }
      }
    }
    if (safeCols.length > 0) {
      // Wähle eine sichere Spalte (bevorzugt Mitte)
      const middle = Math.floor(COLS / 2);
      if (safeCols.includes(middle)) {
        return middle;
      }
      return safeCols[Math.floor(Math.random() * safeCols.length)];
    }

    // 7. Spalten in der Mitte bevorzugen
    const middle = Math.floor(COLS / 2);
    if (dropDisc(middle, currentBoard) !== null) {
      return middle;
    }

    // 8. Zufällige Spalte
    let randomCol;
    do {
      randomCol = Math.floor(Math.random() * COLS);
    } while (dropDisc(randomCol, currentBoard) === null);
    return randomCol;
  };

  const handlePlayerMove = (col: number) => {
    if (gameOver || currentPlayer !== 'red') return;

    const row = dropDisc(col);
    if (row === null) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = 'red';
    setBoard(newBoard);

    // Spieler-Sound abspielen
    playSound('circle');

    if (checkWin(row, col, 'red', newBoard)) {
      setGameOver(true);
      setWinner('Player (Circle) won!');
      playSound('win');
      return;
    }

    setCurrentPlayer('yellow');

    // Computer-Zug nach kurzer Verzögerung
    setTimeout(() => {
      const computerCol = findBestMove(newBoard);
      const computerRow = dropDisc(computerCol, newBoard);
      
      if (computerRow !== null) {
        const updatedBoard = newBoard.map(row => [...row]);
        updatedBoard[computerRow][computerCol] = 'yellow';
        setBoard(updatedBoard);

        // Computer-Sound abspielen
        playSound('cross');

        if (checkWin(computerRow, computerCol, 'yellow', updatedBoard)) {
          setGameOver(true);
          setWinner('The Computer (Cross) won!');
          playSound('lose');
          return;
        }

        setCurrentPlayer('red');
      }
    }, 500);
  };

  const renderDisc = (player: string) => {
    if (player === 'red') {
      // Kreis für Spieler
      return (
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke={Colors.primaryLimo}
            strokeWidth="14"
          />
        </Svg>
      );
    } else if (player === 'yellow') {
      // Kreuz für Computer
      return (
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <G transform="rotate(45 50 50)">
            <Rect x="44" y="20" width="12" height="60" fill={Colors.primaryLimo} />
            <Rect x="20" y="44" width="60" height="12" fill={Colors.primaryLimo} />
          </G>
        </Svg>
      );
    }
    return null;
  };

  const renderBoard = () => {
    // Überprüfe, ob das Board initialisiert ist
    if (!board || board.length === 0) {
      return null;
    }

    const rows = [];
    
    for (let row = 0; row < ROWS; row++) {
      const cells = [];
      for (let col = 0; col < COLS; col++) {
        const cellValue = board[row]?.[col];
        cells.push(
          <View key={`${row}-${col}`} style={styles.cell}>
            {cellValue && (
              <View style={styles.disc}>
                {renderDisc(cellValue)}
              </View>
            )}
          </View>
        );
      }
      rows.push(
        <View key={`row-${row}`} style={styles.row}>
          {cells}
        </View>
      );
    }
    
    return rows;
  };

  const renderColumnButtons = () => {
    const buttons = [];
    for (let col = 0; col < COLS; col++) {
      buttons.push(
        <View key={`col-${col}`} style={styles.columnButtonContainer}>
          <TouchableOpacity
            style={styles.columnButton}
            onPress={() => handlePlayerMove(col)}
            disabled={gameOver || currentPlayer !== 'red'}
          >
            <Text style={styles.columnButtonText}>▼</Text>
          </TouchableOpacity>
          {col < COLS - 1 && <View style={styles.columnDivider} />}
        </View>
      );
    }
    return buttons;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar mit Sound und Help Buttons */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={() => setSoundOn(!soundOn)}
        >
          {soundOn ? (
            <IconVolume color={Colors.primaryLimo} />
          ) : (
            <IconVolumeOff color={Colors.primaryLimo} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={() => setShowHelp(true)}
        >
          <IconHelp color={Colors.primaryLimo} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(tabs)/play/MiniGamesScreen")}>
        <IconArrowBack color={Colors.primaryLimo} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Connect Four</Text>
        
        <View style={styles.gameContainer}>
          {/* Spalten-Buttons oben */}
          <View style={styles.columnButtons}>
            {renderColumnButtons()}
          </View>
          
          {/* Spielfeld */}
          <View style={styles.gameBoard}>
            {renderBoard()}
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.status}>
            {gameOver ? winner : `Player (Circle), it's your turn!`}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.gameButton} onPress={initializeBoard}>
              <Text style={styles.gameButtonText}>New Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Help Modal */}
      <Modal
        visible={showHelp}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHelp(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How to Play</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>
                • Connect Four is a two-player strategy game{'\n\n'}
                • Players take turns dropping their pieces (circles or crosses) into a 7×6 grid{'\n\n'}
                • The goal is to connect four of your pieces in a row (horizontally, vertically, or diagonally){'\n\n'}
                • Click on the arrow buttons above the board to drop your piece in that column{'\n\n'}
                • The piece will fall to the lowest available position in the selected column{'\n\n'}
                • The first player to connect four pieces wins!{'\n\n'}
                • If the board is full and no one has won, the game is a draw{'\n\n'}
                • You play as the green circles, the computer plays as green crosses{'\n\n'}
                • Good luck and have fun!
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowHelp(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  topBar: {
    position: "absolute",
    top: 72,
    right: Gaps.g16,
    flexDirection: 'row',
    gap: Gaps.g16,
    zIndex: 10,
  },
  topBarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: Gaps.g16,
    marginTop: 50, // Added 50px margin to move game down
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.primaryLimo,
    marginBottom: Gaps.g24,
    textAlign: 'center',
    fontFamily: Fonts.pressStart2P,
  },
  gameContainer: {
    alignItems: 'center',
  },
  columnButtons: {
    flexDirection: 'row',
    marginBottom: 8,
    width: boardWidth,
  },
  columnButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  columnButton: {
    width: buttonWidth,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryLimo,
    borderWidth: 1,
    borderColor: Colors.primaryLimo,
  },
  columnDivider: {
    width: dividerWidth,
    height: 40,
    backgroundColor: Colors.black,
  },
  columnButtonText: {
    color: Colors.black,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.pressStart2P,
  },
  gameBoard: {
    width: boardWidth,
    height: ROWS * cellSize,
    borderWidth: 1,
    borderColor: Colors.primaryLimo,
    backgroundColor: Colors.black,
  },
  row: {
    flexDirection: 'row',
    height: cellSize,
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderWidth: 1,
    borderColor: Colors.primaryLimo,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disc: {
    width: cellSize * 0.7,
    height: cellSize * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    marginTop: Gaps.g24,
    alignItems: 'center',
  },
  status: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.primaryLimo,
    textAlign: 'center',
    marginBottom: Gaps.g16,
    fontFamily: Fonts.pressStart2P,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Gaps.g16,
  },
  gameButton: {
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.primaryLimo,
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g8,
  },
  gameButtonText: {
    color: Colors.primaryLimo,
    fontSize: FontSizes.TextSmallFs,
    fontWeight: FontWeights.SubtitleFw as any,
    fontFamily: Fonts.pressStart2P,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.primaryLimo,
    borderRadius: 8,
    padding: Gaps.g24,
    margin: Gaps.g16,
    maxWidth: 400,
    maxHeight: 500,
  },
  modalTitle: {
    fontSize: FontSizes.H2Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.primaryLimo,
    textAlign: 'center',
    marginBottom: Gaps.g16,
    fontFamily: Fonts.pressStart2P,
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.TextMediumFw as any,
    color: Colors.primaryLimo,
    lineHeight: 24,
    fontFamily: Fonts.pressStart2P,
  },
  closeButton: {
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.primaryLimo,
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g8,
    marginTop: Gaps.g16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.primaryLimo,
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    fontFamily: Fonts.pressStart2P,
  },
  backButton: {
    position: 'absolute',
    top: 72,
    left: 16,
    zIndex: 10,
  },
});

export default ConnectFourScreen; 