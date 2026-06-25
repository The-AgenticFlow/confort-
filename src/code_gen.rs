use rand::seq::SliceRandom;

const VALID_CHARS: &str = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789";

pub fn generate_code() -> String {
    let mut rng = rand::thread_rng();
    let chars: Vec<char> = VALID_CHARS.chars().collect();

    (0..4)
        .map(|_| *chars.choose(&mut rng).unwrap())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

    #[test]
    fn test_generate_code_length() {
        let code = generate_code();
        assert_eq!(code.len(), 4);
    }

    #[test]
    fn test_generate_code_valid_chars() {
        for _ in 0..100 {
            let code = generate_code();
            for c in code.chars() {
                assert!(
                    VALID_CHARS.contains(c),
                    "Code {} contains invalid char: {}",
                    code,
                    c
                );
            }
        }
    }

    #[test]
    fn test_generate_code_excludes_invalid() {
        for _ in 0..1000 {
            let code = generate_code();
            assert!(!code.contains('O'), "Code {} contains O", code);
            assert!(!code.contains('o'), "Code {} contains o", code);
            assert!(!code.contains('I'), "Code {} contains I", code);
            assert!(!code.contains('i'), "Code {} contains i", code);
            assert!(!code.contains('0'), "Code {} contains 0", code);
            assert!(!code.contains('1'), "Code {} contains 1", code);
        }
    }

    #[test]
    fn test_generate_code_entropy() {
        let mut codes = HashSet::new();

        for _ in 0..100 {
            codes.insert(generate_code());
        }

        let unique_count = codes.len();
        assert!(
            unique_count >= 50,
            "Expected at least 50 unique codes in 100 calls, got {}",
            unique_count
        );
    }
}
